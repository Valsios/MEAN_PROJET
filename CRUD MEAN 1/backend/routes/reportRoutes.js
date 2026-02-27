const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// POST créer un report
router.post('/', async (req, res) => {
    try {
        const report = new Report({
            ...req.body,
            statut: 'en_attente'
        });
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET tous les reports avec les informations populées
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('clientId')
            .populate({
                path: 'boutiqueId',
                populate: {
                    path: 'categorieId'
                }
            })
            .sort({ dateReport: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET un report par ID
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('clientId')
            .populate({
                path: 'boutiqueId',
                populate: {
                    path: 'categorieId'
                }
            });
        if (!report) {
            return res.status(404).json({ message: 'Report non trouvé' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// PUT répondre à un report (valider/refuser avec commentaire)
router.put('/respond/:id', async (req, res) => {
    try {
        const { statut, commentaire } = req.body;
        
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            {
                statut,
                commentaire,
                dateValidation: new Date()
            },
            { new: true, runValidators: true }
        );
        
        if (!report) {
            return res.status(404).json({ message: 'Report non trouvé' });
        }
        
        res.json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lire tous les Reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET les reports d'un client
router.get('/client/:clientId', async (req, res) => {
  try {
    const reports = await Report.find({ clientId: req.params.clientId })
      .populate('boutiqueId')
      .sort({ dateReport: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un Report
router.put('/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id,
        req.body, { new: true });
        res.json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Supprimer un Report
router.delete('/:id', async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.json({ message: "Report supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;