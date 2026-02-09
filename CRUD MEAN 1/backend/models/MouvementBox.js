const mongoose = require('mongoose');
const { Schema } = mongoose;

const MouvementBoxSchema = new Schema({
  boxId: {
    type: Schema.Types.ObjectId,
    ref: 'Box',
    required: true
  },
  boutiqueId: {
    type: Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date,
    default: null
  },
  statut: {
    type: String,
    enum: ['en_cours', 'terminee'],
    required: true
  }
}, { timestamps: true });

/* une seule occupation active par box */
MouvementBoxSchema.index(
  { boxId: 1 },
  {
    unique: true,
    partialFilterExpression: { dateFin: null }
  }
);

module.exports = mongoose.model('MouvementBox', MouvementBoxSchema);
