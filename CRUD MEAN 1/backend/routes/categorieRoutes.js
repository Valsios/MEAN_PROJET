const express = require('express');
const router = express.Router();
const Categorie = require('../models/Categorie');

// Créer une catégorie
router.post('/', async (req, res) => {
  try {
    const categorie = new Categorie(req.body);
    await categorie.save();
    res.status(201).json(categorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une catégorie
router.put('/:id', async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // renvoie l'objet mis à jour
    );
    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    res.json(categorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une catégorie
router.delete('/:id', async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
