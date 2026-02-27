const express = require('express');
const router = express.Router();
const PaiementLoyer = require('../models/PaiementLoyer');
const Boutique = require('../models/Boutique');
const MouvementBox = require('../models/MouvementBox');
const Box = require('../models/Box');

/**
 * Obtenir informations paiement d'une boutique
 * → dernier mois payé
 * → prochain mois à payer
 */
router.get('/info/:boutiqueId', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.boutiqueId)
      .populate('boxActuelleId');

    if (!boutique || !boutique.boxActuelleId) {
      return res.status(400).json({ message: 'Boutique sans box active' });
    }

    // dernier paiement
    const dernierPaiement = await PaiementLoyer
      .findOne({ boutiqueId: boutique._id })
      .sort({ annee: -1, mois: -1 });

    let prochainMois;
    let prochaineAnnee;

    if (dernierPaiement) {
      prochainMois = dernierPaiement.mois + 1;
      prochaineAnnee = dernierPaiement.annee;

      if (prochainMois > 12) {
        prochainMois = 1;
        prochaineAnnee++;
      }

    } else {
      // jamais payé → dateDebut du mouvement en cours
      const mouvement = await MouvementBox.findOne({
        boutiqueId: boutique._id,
        dateFin: null
      });

      if (!mouvement) {
        return res.status(400).json({ message: 'Aucun mouvement actif' });
      }

      const dateDebut = new Date(mouvement.dateDebut);
      prochainMois = dateDebut.getMonth() + 1;
      prochaineAnnee = dateDebut.getFullYear();
    }

    res.json({
      boutique,
      dernierPaiement,
      prochainMois,
      prochaineAnnee
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * Enregistrer paiement multiple
 * body:
 * {
 *   boutiqueId,
 *   nombreMois
 * }
 */
router.post('/payer', async (req, res) => {
  try {
    const { boutiqueId, nombreMois } = req.body;

    if (nombreMois < 1) {
      return res.status(400).json({ message: 'Nombre de mois invalide' });
    }

    const boutique = await Boutique.findById(boutiqueId)
      .populate('boxActuelleId');

    if (!boutique || !boutique.boxActuelleId) {
      return res.status(400).json({ message: 'Boutique sans box active' });
    }

    // récupérer info prochain paiement
    const dernierPaiement = await PaiementLoyer
      .findOne({ boutiqueId })
      .sort({ annee: -1, mois: -1 });

    let mois;
    let annee;

    if (dernierPaiement) {
      mois = dernierPaiement.mois;
      annee = dernierPaiement.annee;
    } else {
      const mouvement = await MouvementBox.findOne({
        boutiqueId,
        dateFin: null
      });

      const dateDebut = new Date(mouvement.dateDebut);
      mois = dateDebut.getMonth();
      annee = dateDebut.getFullYear();
    }

    const paiements = [];

    for (let i = 0; i < nombreMois; i++) {

      mois++;
      if (mois > 12) {
        mois = 1;
        annee++;
      }

      paiements.push({
        boutiqueId,
        boxId: boutique.boxActuelleId._id,
        montant: boutique.boxActuelleId.prixActuel,
        mois,
        annee,
        datePaiement: new Date()
      });
    }

    await PaiementLoyer.insertMany(paiements);

    res.status(201).json({ message: 'Paiement enregistré' });

  } catch (error) {
    res.status(400).json({
      message: 'Paiement déjà existant ou erreur'
    });
  }
});

module.exports = router;