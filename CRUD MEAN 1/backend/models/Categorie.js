const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorieSchema = new Schema({
  nom: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Categorie', CategorieSchema);
