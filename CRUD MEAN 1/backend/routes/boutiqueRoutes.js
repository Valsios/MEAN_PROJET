const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Boutique = require('../models/Boutique');
const Box = require('../models/Box');
const Commande = require('../models/Commande');
const PaiementLoyers = require('../models/PaiementLoyer');
const Produit = require('../models/Produit');

//get box boutique
router.get('/:id/box', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    const box = await Box.findById(new mongoose.Types.ObjectId(boutique.boxActuelleId));
    res.json(box);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get payement loyers
router.post('/payementLoyers', async (req, res) => {
  try {
    const { boutiqueId , annee } =req.body;
    const paiementLoyers = await PaiementLoyers.find({ 
      boutiqueId: boutiqueId,
      annee : annee
    });
    
    res.json(paiementLoyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Créer une boutique

// Version encore plus simple :
router.get('/:id/commandes', async (req, res) => {
  try {
    const commandes = await Commande.find({ 
      boutiqueId: req.params.id,
      statut : 'en_attente'
    });
    
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
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

// Version encore plus simple :
router.get('/:id/produits', async (req, res) => {
  try {
    const produits = await Produit.find({ 
      boutiqueId: req.params.id,
      state: true 
    });
    
    res.json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete/Désactiver un produit
router.delete('/deleteProduit/:produitId', async (req, res) => {
  try {
    const { produitId } = req.params; // Récupération depuis l'URL
    
    const produit = await Produit.updateOne(
      { _id: produitId },
      { $set: { state: false } }
    );
    
    
    res.status(200).json({ 
      message: "Produit désactivé avec succès",
      produit: produit 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Créer un produit
router.post('/createProduit', async (req, res) => {
  try {
    const produit = await Produit.insertOne(req.body);;
    res.status(201).json(produit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




module.exports = router;
