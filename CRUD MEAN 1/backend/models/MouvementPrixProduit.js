// models/mouvementPrixProduit.model.js
const mongoose = require("mongoose");

const mouvementPrixSchema = new mongoose.Schema({
  produitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produit",
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

  dateApplication: {
    type: Date,
    default: Date.now
  },

  commentaire: {
    type: String
  }
}, { versionKey : false});

module.exports = mongoose.model("MouvementPrixProduit", mouvementPrixSchema);
