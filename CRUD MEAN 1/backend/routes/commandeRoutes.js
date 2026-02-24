const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const MouvementStock = require('../models/MouvementStock');


// Valider une commande
router.get('/annulerCommande/:id', async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,                   
      { 
        statut: 'annulee',              
        validateOrCanceledAt: new Date()       
      },
      { 
        new: true,                        
        runValidators: true                
      }
    );
    

    // Réponse succès
    res.json({ 
      message: "Commande annulee avec succès", 
      commande 
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Valider une commande
router.get('/validerCommande/:id', async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,                   
      { 
        statut: 'validee',              
        validateOrCanceledAt: new Date()       
      },
      { 
        new: true,                        
        runValidators: true                
      }
    );
    updateStock(commande);

    // Réponse succès
    res.json({ 
      message: "Commande validée avec succès", 
      commande 
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//commande sur place 
router.post('/createCommande', async (req, res) => {
  try {
     const commandeToInsert = req.body;
    // Vérification du stock
    const check = await checkArticle(commandeToInsert);
   
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    const commande = await Commande.insertOne(commandeToInsert);
     updateStock(commande);
  
    res.status(201).json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function checkArticle(commande) {
  
  const articles = commande.articles;

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const produit = await Produit.findById(art.produitId);
    if (produit.gestionStock === true && produit.stockActuel < art.quantite) {
      return { 
        ok: false, 
        message: `Stock insuffisant pour ${produit.nom}` 
      };
    }
  }

  return { ok: true };
}
async function updateStock(commande) {
  const articles = commande.articles;

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];

    await Produit.updateOne(
      { _id: art.produitId },
      { $inc: { stockActuel: -art.quantite } }
    );
    const produit = await Produit.findById(art.produitId);

    // Enregistrer le mouvement de stock
    await MouvementStock.create({
          produitId: new mongoose.Types.ObjectId(art.produitId),
          quantite: art.quantite,
          type : 'SORTIE' ,
          stockAvant: produit.stockActuel,
          stockApres : produit.stockActuel - art.quantite
        });
  }
};

module.exports = router;