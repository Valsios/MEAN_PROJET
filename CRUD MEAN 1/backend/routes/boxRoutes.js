const express = require('express');
const router = express.Router();
const Box = require('../models/Box');


// Lire toutes les box (actives par défaut)
router.get('/', async (req, res) => {
  try {
    const filter = { etat: 'actif' }; // Par défaut, ne montrer que les actives
    
    if (req.query.statut) {
      filter.statut = req.query.statut;
    }
    
    // Option pour voir les inactives
    if (req.query.includeInactives === 'true') {
      delete filter.etat;
    }
    
    const boxes = await Box.find(filter);
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// "Supprimer" = mise à jour de l'état
router.delete('/:id', async (req, res) => {
  try {
    const box = await Box.findById(req.params.id);
    
    if (box && box.statut === 'occupee') {
      return res.status(400).json({ 
        message: 'Impossible de désactiver une box occupée' 
      });
    }
    
    // Désactivation logique
    const updatedBox = await Box.findByIdAndUpdate(
      req.params.id,
      { etat: 'inactif' },
      { new: true }
    );
    
    res.json({ 
      message: 'Box désactivée avec succès',
      box: updatedBox 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour réactiver une box
router.patch('/:id/reactiver', async (req, res) => {
  try {
    const box = await Box.findByIdAndUpdate(
      req.params.id,
      { etat: 'actif' },
      { new: true }
    );
    res.json({ 
      message: 'Box réactivée avec succès',
      box 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Créer une box
router.post('/', async (req, res) => {
  try {
    // Vérifier si le numéro de box existe déjà
    const existingBox = await Box.findOne({ numero: req.body.numero });
    if (existingBox) {
      return res.status(400).json({ 
        message: 'Ce numéro de box existe déjà' 
      });
    }
    
    const box = new Box(req.body);
    await box.save();
    res.status(201).json(box);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mettre à jour une box
router.put('/:id', async (req, res) => {
  try {
    // Vérifier le numéro de box identique (sauf pour la box actuelle)
    const existingBox = await Box.findOne({ 
      numero: req.body.numero,
      _id: { $ne: req.params.id }
    });
    
    if (existingBox) {
      return res.status(400).json({ 
        message: 'Ce numéro de box est déjà utilisé par une autre box' 
      });
    }
    
    // Vérifier le prix négatif
    if (req.body.prixActuel && req.body.prixActuel < 0) {
      return res.status(400).json({ 
        message: 'Le prix ne peut pas être négatif' 
      });
    }
    
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



module.exports = router;
