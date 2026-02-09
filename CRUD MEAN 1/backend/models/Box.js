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
  statut: {
    type: String,
    enum: ['libre', 'occupee'],
    default: 'libre'
  }
}, { timestamps: true });

/* index composite */
BoxSchema.index({ numero: 1, etage: 1 }, { unique: true });

module.exports = mongoose.model('Box', BoxSchema);
