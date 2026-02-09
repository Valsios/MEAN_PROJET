const express = require('express');
const router = express.Router();
const MouvementBox = require('../models/MouvementBox');

// Créer un mouvement
router.post('/', async (req, res) => {
  try {
    const mouvement = new MouvementBox(req.body);
    await mouvement.save();
    res.status(201).json(mouvement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les mouvements
router.get('/', async (req, res) => {
  try {
    const mouvements = await MouvementBox.find()
      .populate('boxId')
      .populate('boutiqueId');
    res.json(mouvements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un mouvement
router.put('/:id', async (req, res) => {
  try {
    const mouvement = await MouvementBox.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(mouvement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un mouvement
router.delete('/:id', async (req, res) => {
  try {
    await MouvementBox.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mouvement supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
