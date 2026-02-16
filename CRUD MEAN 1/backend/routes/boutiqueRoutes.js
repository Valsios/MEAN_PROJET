const express = require('express');
const router = express.Router();

const Boutique = require('../models/Boutique');
const Box = require('../models/Box');
const MouvementBox = require('../models/MouvementBox');


// ======================
// GET ALL
// ======================
router.get('/', async (req, res) => {
  try {
    const boutiques = await Boutique.find()
      .populate('boxActuelleId')
      .populate('categorieId');
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================
// CREATE
// ======================
router.post('/', async (req, res) => {
  try {
    const { boxActuelleId } = req.body;

    const boutique = new Boutique(req.body);
    await boutique.save();

    if (boxActuelleId) {
      const box = await Box.findById(boxActuelleId);

      if (!box || box.statut !== 'libre') {
        return res.status(400).json({ message: 'Box non disponible' });
      }

      box.statut = 'occupee';
      await box.save();

      boutique.boxActuelleId = box._id;
      await boutique.save();

      await MouvementBox.create({
        boxId: box._id,
        boutiqueId: boutique._id,
        dateDebut: new Date(),
        statut: 'en_cours'
      });
    }

    res.status(201).json(boutique);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ======================
// UPDATE
// ======================
router.put('/:id', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    const ancienBoxId = boutique.boxActuelleId;
    const nouveauBoxId = req.body.boxActuelleId;

    // Si changement de box
    if (ancienBoxId?.toString() !== nouveauBoxId) {

      // Libérer ancien
      if (ancienBoxId) {
        const ancienBox = await Box.findById(ancienBoxId);
        ancienBox.statut = 'libre';
        await ancienBox.save();

        await MouvementBox.findOneAndUpdate(
          { boxId: ancienBoxId, dateFin: null },
          { dateFin: new Date(), statut: 'terminee' }
        );
      }

      // Assigner nouveau
      if (nouveauBoxId) {
        const newBox = await Box.findById(nouveauBoxId);

        if (!newBox || newBox.statut !== 'libre') {
          return res.status(400).json({ message: 'Box non disponible' });
        }

        newBox.statut = 'occupee';
        await newBox.save();

        await MouvementBox.create({
          boxId: newBox._id,
          boutiqueId: boutique._id,
          dateDebut: new Date(),
          statut: 'en_cours'
        });
      }
    }

    Object.assign(boutique, req.body);
    await boutique.save();

    res.json(boutique);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ======================
// LIBERER BOX
// ======================
router.post('/:id/liberer-box', async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);

    if (!boutique.boxActuelleId) {
      return res.status(400).json({ message: 'Aucun box assigné' });
    }

    const box = await Box.findById(boutique.boxActuelleId);
    box.statut = 'libre';
    await box.save();

    await MouvementBox.findOneAndUpdate(
      { boxId: box._id, dateFin: null },
      { dateFin: new Date(), statut: 'terminee' }
    );

    boutique.boxActuelleId = null;
    await boutique.save();

    res.json({ message: 'Box libéré' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
