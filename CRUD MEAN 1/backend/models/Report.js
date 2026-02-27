const mongoose = require("mongoose");
const { type } = require("node:os");
const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    boutiqueId: {
      type: Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    commentaire: {
        type: String
    },
    dateReport: {
      type: Date,
      default: Date.now,
    },
    dateValidation: {
        type: Date,
        default: null,
    },
    statut: {
      type: String,
      enum: ["en_attente", "valide", "refuse"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", ReportSchema);
