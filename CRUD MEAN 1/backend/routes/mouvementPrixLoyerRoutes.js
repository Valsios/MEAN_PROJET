const express = require('express');
const router = express.Router();
const MouvementPrixLoyer = require('../models/MouvementPrixLoyer');
const Box = require('../models/Box');

/**
 * Changer le prix d’un box
 */
router.post('/', async (req, res) => {
  try {
    const { boxId, nouveauPrix, motif } = req.body;

    const box = await Box.findById(boxId);
    if (!box) return res.status(404).json({ message: 'Box introuvable' });

    // Historique
    const mouvement = new MouvementPrixLoyer({
      boxId,
      ancienPrix: box.prixActuel,
      nouveauPrix,
      motif
    });

    await mouvement.save();

    // Mise à jour prix actuel
    box.prixActuel = nouveauPrix;
    await box.save();

    res.status(201).json(mouvement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Historique des prix par box
 */
router.get('/box/:boxId', async (req, res) => {
  try {
    const mouvements = await MouvementPrixLoyer
      .find({ boxId: req.params.boxId })
      .sort({ dateMvt: -1 });

    res.json(mouvements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
