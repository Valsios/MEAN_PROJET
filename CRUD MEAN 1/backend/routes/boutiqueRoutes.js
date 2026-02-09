const express = require('express');
const router = express.Router();
const Boutique = require('../models/Boutique');

// Créer une boutique
router.post('/', async (req, res) => {
  try {
    const boutique = new Boutique(req.body);
    await boutique.save();
    res.status(201).json(boutique);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les boutiques
router.get('/', async (req, res) => {
  try {
    const boutiques = await Boutique.find().populate('boxActuelleId');
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une boutique
router.put('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(boutique);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une boutique
router.delete('/:id', async (req, res) => {
  try {
    await Boutique.findByIdAndDelete(req.params.id);
    res.json({ message: 'Boutique supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
