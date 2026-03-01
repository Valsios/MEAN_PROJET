// models/produit.model.js
const mongoose = require("mongoose");

const reviewProduitSchema = new mongoose.Schema({
  client: {
    type: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
      },
      email: {
        type: String,
        required: true
      }
    },
    required: true
  },

  commentaire: {
    type: String
  },

  note: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5
  },

  produitId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produit",
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

module.exports = mongoose.model("ReviewProduit", reviewProduitSchema);