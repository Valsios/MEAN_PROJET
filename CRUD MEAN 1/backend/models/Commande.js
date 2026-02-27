const mongoose = require('mongoose');

const CommandeSchema = new mongoose.Schema({
  boutiqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', required: true },
  client: {
      type: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Client"
        },
        email: {
          type: String
        },
        telephone:{
          type : String
        }
      
      },
      default : null
    },
  typeCommande: { type: String, enum: ['en_ligne', 'sur_place'], required: true },

  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'annule','panier'],
    default: 'en_attente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  validateOrCanceledAt: {
    type: Date,
    default: Date.now
  },
  articles: [
    {
      produitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
      nomProduit: String,
      quantite: Number,
      prixUnitaire: Number,
      remise : Number,
      total: Number
    }
  ],

  montantTotal: Number

}, { versionKey: false });

module.exports = mongoose.model('Commande', CommandeSchema);