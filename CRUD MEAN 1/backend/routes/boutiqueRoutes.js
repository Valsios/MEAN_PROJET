const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Boutique = require('../models/Boutique');
const Box = require('../models/Box');
const Commande = require('../models/Commande');
const PaiementLoyers = require('../models/PaiementLoyer');
const Produit = require('../models/Produit');
const ReviewProduit = require('../models/ReviewProduit');
const ReviewBoutique = require('../models/ReviewBoutique');
const Categorie = require('../models/Categorie');
const Promotion = require('../models/Promotion');

//get all categorie
router.get('/allCategories', async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await ReviewBoutique.find({ 
             boutiqueId: req.params.id
           });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all payement loyer
router.get('/:id/payementLoyers', async (req, res) => {
  try {
    const paiementLoyers = await PaiementLoyers.find(
      {
        boutiqueId : req.params.id
      }
      
    );
    res.json(paiementLoyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
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

// get payement loyers
router.post('/payementLoyers', async (req, res) => {
  try {
    const { boutiqueId, annee } = req.body;
    
    // Récupérer la boutique pour avoir la date d'entrée
    const boutique = await Boutique.findById(boutiqueId);
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }
    
    // Récupérer la date d'entrée du box
    const dateEntree = new Date(boutique.dateEntryBox);
    const entryYear = dateEntree.getFullYear();
    const entryMonth = dateEntree.getMonth() + 1;
    
    // Récupérer les paiements existants pour l'année
    const paiementsExistants = await PaiementLoyers.find({ 
      boutiqueId: boutiqueId,
      annee: annee
    }).sort({ mois: 1 });
    
  
    const paiementsParMois = {};
    paiementsExistants.forEach(p => {
      paiementsParMois[p.mois] = p;
    });
    
    
    const listeComplete = [];
    
    for (let mois = 1; mois <= 12; mois++) {
      
      if (paiementsParMois[mois]) {
        listeComplete.push(paiementsParMois[mois]);
      } 
     
      else if (annee < entryYear || (annee === entryYear && mois < entryMonth)) {
        
        listeComplete.push({
          boutiqueId: boutiqueId,
          boxId: boutique.boxId,
          montant: 0,
          mois: mois,
          annee: annee,
          datePaiement: null,
          createdAt: new Date(),
          _id: null,
          isVirtual: true
        });
      }
      
    }
    
   
    listeComplete.sort((a, b) => a.mois - b.mois);
    
    res.json(listeComplete);
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});
// Version encore plus simple  liste des commandes validee:
router.get('/:id/commandes-validee', async (req, res) => {
  try {
    const commandes = await Commande.find({ 
      boutiqueId: req.params.id,
      statut : 'validee'
    });
    
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Version encore plus simple  liste des commandes en_attente:
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

// Lire toutes les boutiques actif
router.get('/', async (req, res) => {
  try {
    const boutiques = await Boutique.find(
      {
        dateEntryBox : {$ne : null}
      }
    ).populate('boxActuelleId');

      const boutiqueAvecNombreProduit = await Promise.all(boutiques.map(async (boutique) => {
      const boutiqueObj = boutique.toObject();
      const produits = await Produit.find({ 
        boutiqueId: boutique._id,
        state: true 
      });
    
      
      boutiqueObj.nombreProduit = produits.length;
      return boutiqueObj;
    }));
    res.json(boutiqueAvecNombreProduit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire toutes les boutiques par categorie
router.get('/categorie/:id', async (req, res) => {
  try {
    const boutiques = await Boutique.find(
      {
        categorieId : req.params.id
      }
    ).populate('boxActuelleId');
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
router.get('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.find({
      _id : req.params.id
    }).populate('boxActuelleId');
    res.json(boutique);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Version encore plus simple get all produit de la boutique
router.get('/:id/produits', async (req, res) => {
  try {
    const produits = await Produit.find({ 
      boutiqueId: req.params.id,
      state: true 
    });
    
    const produitsAvecNote = await Promise.all(produits.map(async (produit) => {
      const produitObj = produit.toObject();
      const note = await getNoteProduit(produit._id);
      const reviews = await ReviewProduit.find({ produitId: produit._id });
      const promotionActive = await Promotion.find({
            produitId: new mongoose.Types.ObjectId(produit._id),
            $or: [
              { dateFin: null },                 // Promotions sans date de fin
              { dateFin: { $gt: new Date() } }   // Promotions avec date de fin dans le futur
            ]
          });
      produitObj.noteMoyenne = note;
      produitObj.nombreReviews = reviews.length;
      if(promotionActive[0])
      {
          produitObj.promotionActive = promotionActive[0].pourcentage;
          produitObj.prixPromo = produit.prixActuel - (produit.prixActuel*(produitObj.promotionActive/100));
      }
      
      return produitObj;
    }));
    
    res.json(produitsAvecNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getNoteProduit(produitId)
{

    const reviews = await ReviewProduit.find({ 
           produitId: produitId
         });
    let note = 0;
    for(let i = 0; i < reviews.length ; i++)
    {
        note += reviews[i].note;
    }
    return note/reviews.length; 
}


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
