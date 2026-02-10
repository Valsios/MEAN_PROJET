const mongoose = require('mongoose');

const MouvementPrixLoyerSchema = new mongoose.Schema({
  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: true
  },
  ancienPrix: {
    type: Number,
    required: true
  },
  nouveauPrix: {
    type: Number,
    required: true
  },
  dateMvt: {
    type: Date,
    default: Date.now
  },
  motif: {
    type: String
  }
});

MouvementPrixLoyerSchema.index({ boxId: 1, dateMvt: -1 });

module.exports = mongoose.model(
  'MouvementPrixLoyer',
  MouvementPrixLoyerSchema
);
