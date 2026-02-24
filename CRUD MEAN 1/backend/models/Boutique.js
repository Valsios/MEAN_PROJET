const mongoose = require('mongoose');
const { Schema } = mongoose;

const BoutiqueSchema = new Schema({
  nom: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  boxActuelleId: {
    type: Schema.Types.ObjectId,
    ref: 'Box',
    default: null
  },
  categorieId: {
    type: Schema.Types.ObjectId,
    ref: 'Categorie',
    default: null
  },
  dateEntryBox: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Boutique', BoutiqueSchema);
