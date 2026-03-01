// models/MouvementStock.js
const mongoose = require('mongoose');

const mouvementStockSchema = new mongoose.Schema({
  produitId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Produit', 
    required: true 
  },
  type: {
    type: String,
    enum: ['ENTREE', 'SORTIE'],
    required: true
  },
  quantite: {
    type: Number,
    required: true
  },
  stockAvant: {
    type: Number,
    required: true
  },
  stockApres: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  referenceId : {
    type : String,
    required :false,
    default : null
  }
}, { versionKey: false });

// Index pour les recherches
mouvementStockSchema.index({ produitId: 1, date: -1 });
mouvementStockSchema.index({ reference: 1 });

module.exports = mongoose.model('MouvementStock', mouvementStockSchema);