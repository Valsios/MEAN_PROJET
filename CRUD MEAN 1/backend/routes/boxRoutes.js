const express = require('express');
const router = express.Router();
const Box = require('../models/Box');

// Créer une box
router.post('/', async (req, res) => {
  try {
    const box = new Box(req.body);
    await box.save();
    res.status(201).json(box);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les box
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.statut) {
      filter.statut = req.query.statut;
    }
    const boxes = await Box.find(filter);
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour une box
router.put('/:id', async (req, res) => {
  try {
    const box = await Box.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(box);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une box
router.delete('/:id', async (req, res) => {
  try {
    await Box.findByIdAndDelete(req.params.id);
    res.json({ message: 'Box supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
