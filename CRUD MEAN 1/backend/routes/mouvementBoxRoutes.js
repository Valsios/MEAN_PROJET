const express = require('express');
const router = express.Router();
const MouvementBox = require('../models/MouvementBox');
const Boutique = require('../models/Boutique');
const PaiementLoyer = require('../models/PaiementLoyer');

// Créer un mouvement
router.post('/', async (req, res) => {
  try {
    const mouvement = new MouvementBox(req.body);
    await mouvement.save();
    res.status(201).json(mouvement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les mouvements
router.get('/', async (req, res) => {
  try {
    const mouvements = await MouvementBox.find()
      .populate('boxId')
      .populate('boutiqueId');
    res.json(mouvements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un mouvement
router.put('/:id', async (req, res) => {
  try {
    const mouvement = await MouvementBox.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(mouvement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un mouvement
router.delete('/:id', async (req, res) => {
  try {
    await MouvementBox.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mouvement supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer dernier mouvement actif d'une boutique
router.get('/boutique/:boutiqueId/actif', async (req, res) => {
  try {
    const mouvement = await MouvementBox.findOne({
      boutiqueId: req.params.boutiqueId,
      dateFin: null
    });

    res.json(mouvement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir une boutique par ID avec ses mouvements et ses paiement
router.get('/:id/mouvements', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('boxActuelleId');

    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const mouvements = await MouvementBox.find({
      boutiqueId: boutique._id
    }).populate('boxId');

    const paiements = await PaiementLoyer.find({
      boutiqueId: boutique._id
    }).populate('boxId').sort({ annee: -1, mois: -1 });

    res.json({
      boutique,
      mouvements,
      paiements
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
