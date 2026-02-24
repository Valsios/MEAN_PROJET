// models/produit.model.js
const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  boutiqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Boutique",
    required: true
  },

  type: {
    type: String
  },

  gestionStock: {
    type: Boolean,
    default: true
  },

  stockActuel: {
    type: Number,
    default: 0
  },

  prixActuel: {
    type: Number,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  
  image: {
    type : String
  }
  ,
  state : {
    type : Boolean,
    required : true , 
    default : true
  }
},{versionKey : false});

module.exports = mongoose.model("Produit", produitSchema);
