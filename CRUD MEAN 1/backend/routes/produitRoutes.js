const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Produit = require('../models/Produit');
const Promotion = require('../models/Promotion');
const MouvementPrixProduit = require('../models/MouvementPrixProduit');
const MouvementStock = require('../models/MouvementStock');
const ReviewProduit = require('../models/ReviewProduit');
//get reviews 
router.get('/:id/reviews', async (req, res) => {
  try {
    const produitId = req.params.id;
    const reviews = await ReviewProduit.find({ 
         produitId: produitId
       });
    res.json(reviews);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//remplacer promotion
router.post('/promotion/:id/remplacer-promotion', async (req, res) => {
  try {

    const promotionId = req.params.id;
    await Promotion.updateOne(
      { _id: promotionId },
      { $set: { dateFin : new Date() } } // Retourne le document mis à jour
    );
    const newPromo = await Promotion.insertOne(
      req.body
    );  
    res.status(201).json({
      message : " Promotion remplacé ",
      promotion : newPromo
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//ajouter promotion
router.post('/ajouter-promotion', async (req, res) => {
  try {
    const promotion = await Promotion.insertOne(req.body);
    res.status(201).json({
      message : " Promotion ajoutée ",
      promotion : promotion
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// delete promotion
router.delete('/promotion/:id', async (req, res) => {
  try {
    const promotionId = req.params.id;
    const promotion = await Promotion.findByIdAndUpdate(
      promotionId,
      { $set: { dateFin: new Date() } },
      { new: true }  // Retourne le document mis à jour
    );


    res.json({ 
      message: "Promotion désactivé.",
      promotion: promotion
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//function ravitaller stock
//ravitailler stock
router.patch('/:id/restock', async (req, res) => {
  try {
    const produitId = req.params.id;
    const { quantite } = req.body;
    const produit = await Produit.findById(new mongoose.Types.ObjectId(produitId));
    const ancienStock = produit.stockActuel;
    
    // Mettre à jour le prix du produit
    await Produit.updateOne(
      { _id: produitId },
      { $set: { stockActuel: ancienStock + quantite } }
    );

    // Enregistrer le mouvement de stock
    const mouvement_stock = await MouvementStock.create({
      produitId: new mongoose.Types.ObjectId(produitId),
      quantite: quantite,
      type : 'ENTREE' ,
      stockAvant: ancienStock,
      stockApres : ancienStock + quantite
    });

    res.json({ 
      message: "Stock ravitaillé.",
      mouvement: mouvement_stock
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update product
router.put('/:id/update', async (req, res) => {
  try {
    const produitId = req.params.id;
    const { nom, description, image } = req.body; // image est déjà en base64

    // Préparer les données de mise à jour
    const updateData = {
      nom: nom.trim(),
      description: description ? description.trim() : '',
    };
    if (image) {
      updateData.image = image; 
    }


    // Mettre à jour le produit
    const produitMisAJour = await Produit.findByIdAndUpdate(
      produitId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Produit mis à jour avec succès",
      produit: produitMisAJour
    });

  } catch (error) {
    console.error('Erreur update product:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Erreur lors de la mise à jour du produit" });
  }
});

//update price
router.patch('/:id/price', async (req, res) => {
  try {
    const produitId = req.params.id;
    const { newPrice} = req.body;
    const produit = await Produit.findById(new mongoose.Types.ObjectId(produitId));
    const ancienPrix = produit.prixActuel;
    
    // Mettre à jour le prix du produit
    await Produit.updateOne(
      { _id: produitId },
      { $set: { prixActuel: newPrice } }
    );

    // Enregistrer le mouvement de prix
    const mouvement_prix = await MouvementPrixProduit.create({
      produitId: new mongoose.Types.ObjectId(produitId),
      ancienPrix: ancienPrix,
      nouveauPrix: newPrice,
      dateApplication: new Date(),
      commentaire: ancienPrix === null ? "Prix initial" : "Modification de prix"
    });

    res.json({ 
      message: "Prix mis à jour avec succès",
      mouvement: mouvement_prix 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// get Produit By ID
// GET /api/produits/:id
router.get('/:id', async (req, res) => {
  try {
    const produitId = req.params.id;
    const result = await Produit.findById(new mongoose.Types.ObjectId(produitId));
    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get les promotions actives
// GET /api/produit/:id/promotion-active
router.get('/:id/promotion-active', async (req, res) => {
  try {
    const produitId = req.params.id;

    const result = await Promotion.find({
      produitId: new mongoose.Types.ObjectId(produitId),
      $or: [
        { dateFin: null },                 // Promotions sans date de fin
        { dateFin: { $gt: new Date() } }   // Promotions avec date de fin dans le futur
      ]
    });
    
    res.json(result[0]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;