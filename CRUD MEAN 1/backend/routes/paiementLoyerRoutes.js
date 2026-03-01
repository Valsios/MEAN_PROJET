const express = require('express');
const router = express.Router();
const PaiementLoyer = require('../models/PaiementLoyer');
const Boutique = require('../models/Boutique');
const MouvementBox = require('../models/MouvementBox');
const Box = require('../models/Box');

/**
 * Obtenir informations paiement d'une boutique
 * → dernier mois payé
 * → prochain mois à payer
 */
router.get('/info/:boutiqueId', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.boutiqueId)
      .populate('boxActuelleId');

    if (!boutique || !boutique.boxActuelleId) {
      return res.status(400).json({ message: 'Boutique sans box active' });
    }

    const boxActuelId = boutique.boxActuelleId._id;

    // 1. Chercher le dernier paiement TOUS BOX CONFONDUS
    const dernierPaiementTousBox = await PaiementLoyer
      .findOne({ boutiqueId: boutique._id })
      .sort({ annee: -1, mois: -1 });

    let prochainMois;
    let prochaineAnnee;

    // Si aucun paiement n'existe
    if (!dernierPaiementTousBox) {
      // Jamais payé → dateDebut du mouvement en cours
      const mouvement = await MouvementBox.findOne({
        boutiqueId: boutique._id,
        dateFin: null
      });

      if (!mouvement) {
        return res.status(400).json({ message: 'Aucun mouvement actif' });
      }

      const dateDebut = new Date(mouvement.dateDebut);
      prochainMois = dateDebut.getMonth() + 1;
      prochaineAnnee = dateDebut.getFullYear();
    } 
    // Si le dernier paiement concerne le box actuel
    else if (dernierPaiementTousBox.boxId.toString() === boxActuelId.toString()) {
      // Prochain mois = mois suivant le dernier paiement
      prochainMois = dernierPaiementTousBox.mois + 1;
      prochaineAnnee = dernierPaiementTousBox.annee;

      if (prochainMois > 12) {
        prochainMois = 1;
        prochaineAnnee++;
      }
    } 
    // Si le dernier paiement ne concerne PAS le box actuel
    else {
      // Chercher le dernier paiement pour le box actuel
      const dernierPaiementBoxActuel = await PaiementLoyer
        .findOne({ 
          boutiqueId: boutique._id,
          boxId: boxActuelId 
        })
        .sort({ annee: -1, mois: -1 });

      // Si un paiement existe pour le box actuel
      if (dernierPaiementBoxActuel) {
        prochainMois = dernierPaiementBoxActuel.mois + 1;
        prochaineAnnee = dernierPaiementBoxActuel.annee;

        if (prochainMois > 12) {
          prochainMois = 1;
          prochaineAnnee++;
        }
      } 
      // Si aucun paiement pour le box actuel
      else {
        // Prendre la date d'entrée dans le box actuel
        const mouvementActuel = await MouvementBox.findOne({
          boutiqueId: boutique._id,
          boxId: boxActuelId,
          dateFin: null
        });

        if (!mouvementActuel) {
          return res.status(400).json({ message: 'Mouvement actuel introuvable' });
        }

        const dateEntryBox = new Date(mouvementActuel.dateDebut);
        prochainMois = dateEntryBox.getMonth() + 1;
        prochaineAnnee = dateEntryBox.getFullYear();
      }
    }

    res.json({
      boutique,
      dernierPaiement: dernierPaiementTousBox,
      prochainMois,
      prochaineAnnee
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Enregistrer paiement multiple
 * body:
 * {
 *   boutiqueId,
 *   nombreMois
 * }
 */
router.post('/payer', async (req, res) => {
  try {
    const { boutiqueId, nombreMois } = req.body;

    if (nombreMois < 1) {
      return res.status(400).json({ message: 'Nombre de mois invalide' });
    }

    const boutique = await Boutique.findById(boutiqueId)
      .populate('boxActuelleId');

    if (!boutique || !boutique.boxActuelleId) {
      return res.status(400).json({ message: 'Boutique sans box active' });
    }

    const boxActuelId = boutique.boxActuelleId._id;

    // Utiliser la même logique que /info pour trouver le point de départ
    const dernierPaiementTousBox = await PaiementLoyer
      .findOne({ boutiqueId })
      .sort({ annee: -1, mois: -1 });

    let mois;
    let annee;


    // Si aucun paiement n'existe
    if (!dernierPaiementTousBox) {
      const mouvement = await MouvementBox.findOne({
        boutiqueId,
        dateFin: null
      });

      const dateDebut = new Date(mouvement.dateDebut);
      mois = dateDebut.getMonth();
      annee = dateDebut.getFullYear();
    } 
    // Si le dernier paiement concerne le box actuel
    else if (dernierPaiementTousBox.boxId.toString() === boxActuelId.toString()) {
      mois = dernierPaiementTousBox.mois;
      annee = dernierPaiementTousBox.annee;
    } 
    // Si le dernier paiement ne concerne PAS le box actuel
    else {
      const dernierPaiementBoxActuel = await PaiementLoyer
        .findOne({ 
          boutiqueId,
          boxId: boxActuelId 
        })
        .sort({ annee: -1, mois: -1 });

      // Si un paiement existe pour le box actuel
      if (dernierPaiementBoxActuel) {
        mois = dernierPaiementBoxActuel.mois;
        annee = dernierPaiementBoxActuel.annee;
      } 
      // Si aucun paiement pour le box actuel
      else {
        const mouvementActuel = await MouvementBox.findOne({
          boutiqueId,
          boxId: boxActuelId,
          dateFin: null
        });

        const dateEntryBox = new Date(mouvementActuel.dateDebut);
        mois = dateEntryBox.getMonth();
        annee = dateEntryBox.getFullYear();
      }
    }

    const paiements = [];

    for (let i = 0; i < nombreMois; i++) {
      mois++;
      if (mois > 12) {
        mois = 1;
        annee++;
      }

      paiements.push({
        boutiqueId,
        boxId: boxActuelId,
        montant: boutique.boxActuelleId.prixActuel,
        mois,
        annee,
        datePaiement: new Date()
      });
    }

    console.log(paiements);

    await PaiementLoyer.insertMany(paiements);

    

    res.status(201).json({ message: 'Paiement enregistré' });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;