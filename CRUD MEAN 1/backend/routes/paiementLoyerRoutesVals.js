const express = require('express');
const router = express.Router();
const PaiementLoyer = require('../models/PaiementLoyer');

/**
 * Enregistrer un paiement
 */
router.post('/', async (req, res) => {
  try {
    const paiement = new PaiementLoyer(req.body);
    await paiement.save();
    res.status(201).json(paiement);
  } catch (error) {
    res.status(400).json({
      message: 'Paiement déjà enregistré ou données invalides'
    });
  }
});

/**
 * Paiements par boutique
 */
router.get('/boutique/:boutiqueId', async (req, res) => {
  try {
    const paiements = await PaiementLoyer
      .find({ boutiqueId: req.params.boutiqueId })
      .sort({ annee: -1, mois: -1 });

    res.json(paiements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
