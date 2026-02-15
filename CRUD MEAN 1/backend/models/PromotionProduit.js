// models/promotion.model.js
const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  produitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produit",
    required: true
  },

  pourcentage: {
    type: Number,
    required: true
  },

  dateDebut: {
    type: Date,
    required: true
  },

  dateFin: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("Promotion", promotionSchema);
