const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const ReviewBoutique = require('../models/ReviewBoutique');
const ReviewProduit = require('../models/ReviewProduit');
const Commande = require('../models/Commande');
const Produit = require('../models/Produit');
const Promotion = require('../models/Promotion');
const mongoose = require('mongoose'); 


// Récupérer les paniers d'un client (commandes avec statut "panier")
router.get('/:clientId/paniers', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const paniers = await Commande.find({
      'client.id': new mongoose.Types.ObjectId(clientId),
      statut: 'panier'
    })
    .populate('boutiqueId', 'nom telephone') // Infos boutique
    .sort({ createdAt: -1 });
    
    res.json(paniers);
  } catch (error) {
    console.error('Erreur récupération paniers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour la quantité d'un article
router.put('/:commandeId/article/:produitId', async (req, res) => {
  try {
    const { commandeId, produitId } = req.params;
    const { quantite } = req.body;
    
    if (!quantite || quantite < 1) {
      return res.status(400).json({ message: 'Quantité invalide' });
    }
    
    const commande = await Commande.findById(commandeId);
    
    
    // Trouver l'article dans le panier
    const article = commande.articles.find(
      a => a.produitId.toString() === produitId
    );
    
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }
    
    article.quantite = quantite;
    if (article.remise && article.remise > 0) {
      article.total = article.prixUnitaire * quantite * (1 - article.remise / 100);
    } else {
      article.total = article.prixUnitaire * quantite;
    }
    
    // Recalculer le montant total de la commande
    commande.montantTotal = commande.articles.reduce((sum, a) => sum + (a.total || a.prixUnitaire * a.quantite), 0);
    
    await commande.save();
    
    res.json({
      message: 'Quantité mise à jour',
      commande
    });
    
  } catch (error) {
    console.error('Erreur mise à jour quantité:', error);
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un article du panier
router.delete('/:commandeId/article/:produitId', async (req, res) => {
  try {
    const { commandeId, produitId } = req.params;
    
    const commande = await Commande.findById(commandeId);
    
    // Filtrer pour supprimer l'article
    commande.articles = commande.articles.filter(
      a => a.produitId.toString() !== produitId
    );
    
    if (commande.articles.length === 0) {
      // Si plus d'articles, supprimer la commande
      await Commande.findByIdAndDelete(commandeId);
      return res.json({ 
        message: 'Panier supprimé (vide)', 
        commandeSupprimee: true 
      });
    }
    
    // Recalculer le montant total
    commande.montantTotal = commande.articles.reduce((sum, a) => sum + (a.total || a.prixUnitaire * a.quantite), 0);
    
    await commande.save();
    
    res.json({
      message: 'Article supprimé du panier',
      commande
    });
    
  } catch (error) {
    console.error('Erreur suppression article:', error);
    res.status(500).json({ message: error.message });
  }
});

// Valider une commande (passer de "panier" à "en_attente")
router.put('/:commandeId/valider', async (req, res) => {
  try {
    const { commandeId } = req.params;
    const commande = await Commande.findById(commandeId);
    
    // Mettre à jour le statut
    commande.statut = 'en_attente';
    commande.typeCommande = 'en_ligne';
    commande.createdAt = new Date(); // Mettre à jour la date de validation
    
    await commande.save();
    
    // Populer les informations avant de renvoyer
    await commande.populate('boutiqueId', 'nom telephone');
    
    res.json({
      message: 'Commande validée avec succès',
      commande
    });
    
  } catch (error) {
    console.error('Erreur validation commande:', error);
    res.status(500).json({ message: error.message });
  }
});

// Valider tous les paniers d'un client
router.put('/:clientId/paniers/valider-tout', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const paniers = await Commande.find({
      'client.id': clientId,
      statut: 'panier'
    });
    
    if (paniers.length === 0) {
      return res.status(404).json({ message: 'Aucun panier à valider' });
    }
    
    const resultats = {
      total: paniers.length,
      valides: 0,
      erreurs: 0,
      details: []
    };
    
    // Valider chaque panier
    for (const panier of paniers) {
      try {
        if (panier.articles.length === 0) {
          // Supprimer les paniers vides
          await Commande.findByIdAndDelete(panier._id);
          resultats.details.push({
            id: panier._id,
            statut: 'supprime',
            raison: 'Panier vide'
          });
          continue;
        }
        
        panier.statut = 'en_attente';
        panier.typeCommande = 'en_ligne';
        await panier.save();
        
        resultats.valides++;
        resultats.details.push({
          id: panier._id,
          statut: 'valide'
        });
        
      } catch (error) {
        resultats.erreurs++;
        resultats.details.push({
          id: panier._id,
          statut: 'erreur',
          raison: error.message
        });
      }
    }
    
    res.json({
      message: `${resultats.valides} commande(s) validée(s) sur ${resultats.total}`,
      resultats
    });
    
  } catch (error) {
    console.error('Erreur validation multiple:', error);
    res.status(500).json({ message: error.message });
  }
});

// Vider tous les paniers d'un client
router.delete('/:clientId/paniers/vider', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const resultat = await Commande.deleteMany({
      'client.id': clientId,
      statut: 'panier'
    });
    
    res.json({
      message: `${resultat.deletedCount} panier(s) vidé(s)`,
      deletedCount: resultat.deletedCount
    });
    
  } catch (error) {
    console.error('Erreur vidage paniers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un article au panier (si vous avez besoin de cette fonctionnalité)
router.post('/:clientId/panier/ajouter', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { boutiqueId, produitId, quantite = 1, clientEmail, clientTelephone } = req.body;
    
    // Validation
    if (!boutiqueId || !produitId) {
      return res.status(400).json({ message: 'boutiqueId et produitId sont requis' });
    }

    // Vérifier que le produit existe
    const produit = await Produit.findById(produitId);
    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Vérifier le stock
    const quantiteAjout = Number(quantite) || 1;
    if (produit.stock !== undefined && produit.stock < quantiteAjout) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    // Vérifier si le client a déjà un panier pour cette boutique
    let panier = await Commande.findOne({
      'client.id': clientId,
      boutiqueId: boutiqueId,
      statut: 'panier'
    });

    if (!panier) {
      // Créer un nouveau panier
      panier = new Commande({
        boutiqueId: boutiqueId,
        client: {
          id: clientId,
          email: clientEmail || null,
          telephone: clientTelephone || null
        },
        typeCommande: 'en_ligne',
        statut: 'panier',
        articles: [],
        montantTotal: 0
      });
    }

    // Prix unitaire (gérer les différents noms de champ)
    const prixUnitaire = Number(produit.prixActuel) || 0;
    
    const promotionActive = await Promotion.find({
                produitId: new mongoose.Types.ObjectId(produit._id),
                $or: [
                  { dateFin: null },                 // Promotions sans date de fin
                  { dateFin: { $gt: new Date() } }   // Promotions avec date de fin dans le futur
                ]
              });
          
    const remise = promotionActive[0]?.pourcentage || 0;
    
    // Calculer le total de l'article
    let totalArticle = prixUnitaire * quantiteAjout;
    if (remise > 0) {
      totalArticle = totalArticle * (1 - remise / 100);
    }
    totalArticle = Math.round(totalArticle * 100) / 100; // Arrondir à 2 décimales

    // Vérifier si le produit est déjà dans le panier
    const articleExistant = panier.articles.find(
      a => a.produitId.toString() === produitId
    );

    if (articleExistant) {
      // Mettre à jour quantité
      articleExistant.quantite = Number(articleExistant.quantite) + quantiteAjout;
      
      // Recalculer total avec remise
      if (articleExistant.remise > 0) {
        articleExistant.total = articleExistant.prixActuel * articleExistant.quantite * 
                               (1 - articleExistant.remise / 100);
      } else {
        articleExistant.total = articleExistant.prixActuel * articleExistant.quantite;
      }
      articleExistant.total = Math.round(articleExistant.total * 100) / 100;
    } else {
      // Ajouter nouvel article
      panier.articles.push({
        produitId: produitId,
        nomProduit: produit.nom || 'Produit',
        quantite: quantiteAjout,
        prixUnitaire: prixUnitaire,
        remise: remise,
        total: totalArticle
      });
    }

    // Recalculer le montant total du panier (ÉVITER NaN)
    let montantTotal = 0;
    panier.articles.forEach(article => {
      // S'assurer que chaque total est un nombre valide
      const articleTotal = Number(article.total);
      if (!isNaN(articleTotal)) {
        montantTotal += articleTotal;
      }
    });
    
    // Arrondir à 2 décimales
    panier.montantTotal = Math.round(montantTotal * 100) / 100;

    // Sauvegarder
    await panier.save();

    res.status(201).json({
      message: 'Article ajouté au panier',
      panier: panier
    });

  } catch (error) {
    console.error('Erreur ajout panier:', error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer un panier spécifique
router.get('/:commandeId', async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.commandeId)
      .populate('boutiqueId', 'nom telephone adresse email');
    
    
    res.json(commande);
    
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les commandes d'un client
router.get('/:id/commandes', async (req, res) => {
  try {
    const commandes = await Commande.find({
      'client.id': req.params.id,
      statut: { $ne: 'panier' }  // $ne signifie "not equal"
    }).sort({ createdAt: -1 }).populate('boutiqueId');// Trier du plus récent au plus ancien
    
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
