const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["supporting", "contradicting", "context"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    domain: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "document", "video"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    verdict: {
      type: String,
      default: "Pending",
    },

    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    summary: {
      type: String,
      default: "",
    },

    evidence: {
      type: [evidenceSchema],
      default: [],
    },

    sourcesAnalyzed: {
      type: Number,
      default: 0,
    },

    processingTime: {
      type: String,
      default: "",
    },

    verificationId: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Verification", verificationSchema);