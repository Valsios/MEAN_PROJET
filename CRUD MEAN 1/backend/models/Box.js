// models/Box.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const BoxSchema = new Schema({
  numero: {
    type: Number,
    required: true
  },
  etage: {
    type: Number,
    required: true
  },
  prixActuel: {
    type: Number,
    required: true
  },
  statut: {
    type: String,
    enum: ['libre', 'occupee'],
    default: 'libre'
  },
  etat: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  }
}, { timestamps: true });

// Index composite avec etat pour les recherches
BoxSchema.index({ numero: 1, etage: 1 }, { unique: true });

module.exports = mongoose.model('Box', BoxSchema);