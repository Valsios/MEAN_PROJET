const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const ReviewBoutique = require('../models/ReviewBoutique');
const ReviewProduit = require('../models/ReviewProduit');
const Commande = require('../models/Commande');
const mongoose = require('mongoose'); 


// Récupérer les commandes d'un client
router.get('/:id/commandes', async (req, res) => {
  try {
    const commandes = await Commande.find({
      'client.id': req.params.id  // Notez les quotes autour de client.id
    }).sort({ createdAt: -1 }); // Trier du plus récent au plus ancien
    
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//noter boutique
router.post('/noter-boutique', async (req, res) => {
  try {
    const review = new ReviewBoutique(req.body);
    await review.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//noter produit
router.post('/noter-produit', async (req, res) => {
  try {
    const review = new ReviewProduit(req.body);
    await review.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//get by id client
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(new mongoose.Types.ObjectId(req.params.id));
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Créer un client
router.post('/', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
