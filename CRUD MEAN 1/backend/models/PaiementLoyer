const mongoose = require('mongoose');

const PaiementLoyerSchema = new mongoose.Schema({
  boutiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: true
  },
  montant: {
    type: Number,
    required: true
  },
  mois: {
    type: Number,
    min: 1,
    max: 12,
    required: true
  },
  annee: {
    type: Number,
    required: true
  },
  datePaiement: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

PaiementLoyerSchema.index(
  { boutiqueId: 1, mois: 1, annee: 1 },
  { unique: true }
);

module.exports = mongoose.model('PaiementLoyer', PaiementLoyerSchema);
