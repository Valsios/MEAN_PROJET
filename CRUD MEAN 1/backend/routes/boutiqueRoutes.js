const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Boutique = require("../models/Boutique");
const User = require("../models/User");
const Box = require("../models/Box");
const MouvementBox = require("../models/MouvementBox");
const PaiementLoyer = require("../models/PaiementLoyer");

// ======================
// FONCTION DE VÉRIFICATION DE LOYER
// ======================
async function verifierPaiementLoyerMoisActuel(boutiqueId) {
  try {
    const boutique = await Boutique.findById(boutiqueId);

    // Si la boutique n'a pas de box, pas besoin de vérifier le loyer
    if (!boutique || !boutique.boxActuelleId) {
      return {
        estPaye: true,
        message: "Boutique sans box, pas de vérification nécessaire",
      };
    }

    const maintenant = new Date();
    const moisActuel = maintenant.getMonth() + 1; // Les mois vont de 1 à 12
    const anneeActuelle = maintenant.getFullYear();

    // Vérifier si un paiement existe pour le mois et l'année en cours
    const paiementExiste = await PaiementLoyer.findOne({
      boutiqueId: boutiqueId,
      boxId: boutique.boxActuelleId,
      mois: moisActuel,
      annee: anneeActuelle,
    });

    if (paiementExiste) {
      return {
        estPaye: true,
        message: "Loyer du mois actuel payé",
      };
    } else {
      return {
        estPaye: false,
        message: "Le loyer du mois actuel n'a pas été payé",
      };
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du loyer:", error);
    throw error;
  }
}

// ======================
// ROUTE DE VÉRIFICATION DE LOYER
// ======================
router.get("/:id/verifier-paiement-loyer", async (req, res) => {
  try {
    const resultat = await verifierPaiementLoyerMoisActuel(req.params.id);
    res.json(resultat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================
// GET ALL
// ======================
router.get("/", async (req, res) => {
  try {
    const boutiques = await Boutique.find()
      .populate("boxActuelleId")
      .populate("categorieId");
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET une boutique par ID
router.get("/:id", async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate("categorieId")
      .populate("boxActuelleId");
    if (!boutique) {
      return res.status(404).json({ message: "Boutique non trouvée" });
    }
    res.json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================
// CREATE - avec création automatique d'utilisateur
// ======================
router.post("/", async (req, res) => {
  try {
    const { boxActuelleId, password, ...boutiqueData } = req.body;

    // Vérifier si l'email existe déjà
    const emailExiste = await Boutique.findOne({ email: boutiqueData.email });
    if (emailExiste) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Créer la boutique
    const boutique = new Boutique(boutiqueData);
    await boutique.save();

    // 2. Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur associé
    const user = new User({
      email: boutique.email,
      password: hashedPassword, // À hasher avec bcrypt dans une vraie application
      role: "boutique",
      profilId: boutique._id,
      status: true,
    });
    await user.save();

    if (boxActuelleId) {
      const box = await Box.findById(boxActuelleId);

      if (!box || box.statut !== "libre") {
        // Supprimer la boutique et l'utilisateur si erreur
        await Boutique.findByIdAndDelete(boutique._id);
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: "Box non disponible" });
      }

      box.statut = "occupee";
      await box.save();

      boutique.boxActuelleId = box._id;
      boutique.dateEntryBox = new Date();
      await boutique.save();

      await MouvementBox.create({
        boxId: box._id,
        boutiqueId: boutique._id,
        dateDebut: new Date(),
        statut: "en_cours",
      });
    }

    res.status(201).json({
      boutique,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ======================
// UPDATE - SEULEMENT BOUTIQUE, PAS D'UTILISATEUR
// ======================
router.put("/:id", async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    const ancienBoxId = boutique.boxActuelleId;
    const nouveauBoxId = req.body.boxActuelleId;

    // Vérification du loyer si changement de box
    if (ancienBoxId?.toString() !== nouveauBoxId && nouveauBoxId) {
      const verification = await verifierPaiementLoyerMoisActuel(req.params.id);
      if (!verification.estPaye) {
        return res.status(403).json({
          message:
            "Impossible de changer de box : le loyer du mois actuel n'a pas été payé",
          code: "LOYER_IMPAYE",
        });
      }
    }

    // Si changement de box
    if (ancienBoxId?.toString() !== nouveauBoxId) {
      // Libérer ancien
      if (ancienBoxId) {
        const ancienBox = await Box.findById(ancienBoxId);
        ancienBox.statut = "libre";
        await ancienBox.save();

        await MouvementBox.findOneAndUpdate(
          { boxId: ancienBoxId, dateFin: null },
          { dateFin: new Date(), statut: "terminee" },
        );
      }

      // Assigner nouveau
      if (nouveauBoxId) {
        const newBox = await Box.findById(nouveauBoxId);

        if (!newBox || newBox.statut !== "libre") {
          return res.status(400).json({ message: "Box non disponible" });
        }

        newBox.statut = "occupee";
        await newBox.save();

        await MouvementBox.create({
          boxId: newBox._id,
          boutiqueId: boutique._id,
          dateDebut: new Date(),
          statut: "en_cours",
        });

        await User.findOneAndUpdate(
          { profilId: boutique._id},
          { status: true}
        );
      }
    }

    boutique.dateEntryBox = new Date();

    // Mise à jour de la boutique (sans le mot de passe)
    Object.assign(boutique, req.body);
    await boutique.save();

    res.json(boutique);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ======================
// LIBERER BOX - AVEC VÉRIFICATION DE LOYER
// ======================
router.post("/:id/liberer-box", async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    if (!boutique.boxActuelleId) {
      return res.status(400).json({ message: "Aucun box assigné" });
    }

    // Vérification du loyer avant de libérer la box
    const verification = await verifierPaiementLoyerMoisActuel(req.params.id);

    if (!verification.estPaye) {
      return res.status(403).json({
        message:
          "Impossible de libérer la box : le loyer du mois actuel n'a pas été payé",
        code: "LOYER_IMPAYE",
      });
    }

    const box = await Box.findById(boutique.boxActuelleId);
    box.statut = "libre";
    await box.save();

    await MouvementBox.findOneAndUpdate(
      { boxId: box._id, dateFin: null },
      { dateFin: new Date(), statut: "terminee" },
    );

    boutique.boxActuelleId = null;
    boutique.dateEntryBox = null;
    await boutique.save();

    await User.findOneAndUpdate(
          { profilId: boutique._id},
          { status: false}
        );

    res.json({ message: "Box libéré" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir une boutique par ID avec ses mouvements et ses paiement
router.get("/:id/mouvements", async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate(
      "boxActuelleId",
    );

    if (!boutique) {
      return res.status(404).json({ message: "Boutique non trouvée" });
    }

    const mouvements = await MouvementBox.find({
      boutiqueId: boutique._id,
    }).populate("boxId");

    const paiements = await PaiementLoyer.find({
      boutiqueId: boutique._id,
    }).sort({ annee: -1, mois: -1 });

    res.json({
      boutique,
      mouvements,
      paiements,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================
// CHANGER MOT DE PASSE
// ======================
router.post('/:id/change-password', async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    // Trouver l'utilisateur associé via profilId
    const user = await User.findOne({ profilId: boutique._id, role: 'boutique' });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(ancienMotDePasse, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect' });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, salt);

    // Mettre à jour
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
