const express = require('express');
const router = express.Router();

const Boutique = require('../models/Boutique');
const Box = require('../models/Box');
const MouvementBox = require('../models/MouvementBox');
const PaiementLoyer = require('../models/PaiementLoyer');

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
        message: 'Boutique sans box, pas de vérification nécessaire' 
      };
    }

    const maintenant = new Date();
    const moisActuel = maintenant.getMonth() + 1; // Les mois vont de 1 à 12
    const anneeActuelle = maintenant.getFullYear();

    // Vérifier si un paiement existe pour le mois et l'année en cours
    const paiementExiste = await PaiementLoyer.findOne({
      boutiqueId: boutiqueId,
      mois: moisActuel,
      annee: anneeActuelle
    });

    if (paiementExiste) {
      return { 
        estPaye: true, 
        message: 'Loyer du mois actuel payé' 
      };
    } else {
      return { 
        estPaye: false, 
        message: 'Le loyer du mois actuel n\'a pas été payé' 
      };
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du loyer:', error);
    throw error;
  }
}

// ======================
// ROUTE DE VÉRIFICATION DE LOYER
// ======================
router.get('/:id/verifier-paiement-loyer', async (req, res) => {
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
router.get('/', async (req, res) => {
  try {
    const boutiques = await Boutique.find()
      .populate('boxActuelleId')
      .populate('categorieId');
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET une boutique par ID
router.get('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('categorieId')
      .populate('boxActuelleId');
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }
    res.json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================
// CREATE
// ======================
router.post('/', async (req, res) => {
  try {
    const { boxActuelleId } = req.body;

    const boutique = new Boutique(req.body);
    await boutique.save();

    if (boxActuelleId) {
      const box = await Box.findById(boxActuelleId);

      if (!box || box.statut !== 'libre') {
        return res.status(400).json({ message: 'Box non disponible' });
      }

      box.statut = 'occupee';
      await box.save();

      boutique.boxActuelleId = box._id;
      boutique.dateEntryBox = new Date();
      await boutique.save();

      await MouvementBox.create({
        boxId: box._id,
        boutiqueId: boutique._id,
        dateDebut: new Date(),
        statut: 'en_cours'
      });
    }

    res.status(201).json(boutique);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ======================
// UPDATE - AVEC VÉRIFICATION DE LOYER
// ======================
router.put('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    const ancienBoxId = boutique.boxActuelleId;
    const nouveauBoxId = req.body.boxActuelleId;


    // Vérification du loyer si changement de box
    if (ancienBoxId?.toString() !== nouveauBoxId && nouveauBoxId) {
      const verification = await verifierPaiementLoyerMoisActuel(req.params.id);      
      if (!verification.estPaye) {
        return res.status(403).json({ 
          message: 'Impossible de changer de box : le loyer du mois actuel n\'a pas été payé',
          code: 'LOYER_IMPAYE'
        });
      }
    }

    // Si changement de box
    if (ancienBoxId?.toString() !== nouveauBoxId) {

      // Libérer ancien
      if (ancienBoxId) {
        const ancienBox = await Box.findById(ancienBoxId);
        ancienBox.statut = 'libre';
        await ancienBox.save();

        await MouvementBox.findOneAndUpdate(
          { boxId: ancienBoxId, dateFin: null },
          { dateFin: new Date(), statut: 'terminee' }
        );
      }

      // Assigner nouveau
      if (nouveauBoxId) {
        const newBox = await Box.findById(nouveauBoxId);

        if (!newBox || newBox.statut !== 'libre') {
          return res.status(400).json({ message: 'Box non disponible' });
        }

        boutique.dateEntryBox = new Date();
        await boutique.save();

        newBox.statut = 'occupee';
        await newBox.save();

        await MouvementBox.create({
          boxId: newBox._id,
          boutiqueId: boutique._id,
          dateDebut: new Date(),
          statut: 'en_cours'
        });
      }
    }

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
router.post('/:id/liberer-box', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    if (!boutique.boxActuelleId) {
      return res.status(400).json({ message: 'Aucun box assigné' });
    }

    // Vérification du loyer avant de libérer la box
    const verification = await verifierPaiementLoyerMoisActuel(req.params.id);
    
    if (!verification.estPaye) {
      return res.status(403).json({ 
        message: 'Impossible de libérer la box : le loyer du mois actuel n\'a pas été payé',
        code: 'LOYER_IMPAYE'
      });
    }

    const box = await Box.findById(boutique.boxActuelleId);
    box.statut = 'libre';
    await box.save();

    await MouvementBox.findOneAndUpdate(
      { boxId: box._id, dateFin: null },
      { dateFin: new Date(), statut: 'terminee' }
    );

    boutique.boxActuelleId = null;
    boutique.dateEntryBox = null;
    await boutique.save();

    res.json({ message: 'Box libéré' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir une boutique par ID avec ses mouvements et ses paiement
router.get('/:id/mouvements', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('boxActuelleId');

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const mouvements = await MouvementBox.find({
      boutiqueId: boutique._id
    }).populate('boxId');

    const paiements = await PaiementLoyer.find({
      boutiqueId: boutique._id
    }).sort({ annee: -1, mois: -1 });

    res.json({
      boutique,
      mouvements,
      paiements
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;