const mongoose = require("mongoose");

/* =========================================================
   EVIDENCE SCHEMA
========================================================= */

const evidenceSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,

        enum: [
          "supporting",
          "contradicting",
          "context",
        ],

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
    {
      _id: false,
    }
  );

/* =========================================================
   ANALYSIS SCHEMA
========================================================= */

const analysisSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   SIGNAL SCHEMA
========================================================= */

const signalSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      score: {
        type: Number,
        default: 0,
      },

      status: {
        type: String,

        enum: [
          "normal",
          "warning",
          "info",
        ],

        default: "info",
      },

      description: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   IMAGE METADATA SCHEMA
========================================================= */

const metadataSchema =
  new mongoose.Schema(
    {
      filename: {
        type: String,
        default: "",
      },

      mimeType: {
        type: String,
        default: "",
      },

      format: {
        type: String,
        default: "",
      },

      sizeBytes: {
        type: Number,
        default: 0,
      },

      sizeMB: {
        type: Number,
        default: 0,
      },

      hasMetadata: {
        type: Boolean,
        default: false,
      },

      hasExif: {
        type: Boolean,
        default: false,
      },

      hasJfif: {
        type: Boolean,
        default: false,
      },

      hasIccProfile: {
        type: Boolean,
        default: false,
      },

      hasPhotoshopMetadata: {
        type: Boolean,
        default: false,
      },

      hasXmp: {
        type: Boolean,
        default: false,
      },

      cameraMake: {
        type: String,
        default: "",
      },

      cameraModel: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   VERIFICATION SCHEMA
========================================================= */

const verificationSchema =
  new mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },

      type: {
        type: String,

        enum: [
          "text",
          "image",
          "document",
          "video",
        ],

        required: true,
      },

      content: {
        type: String,
        required: true,
      },

      source: {
        type: String,
        default: "",
      },

      /* =====================================================
         RESULT
      ===================================================== */

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

      riskScore: {
        type: Number,

        default: 0,

        min: 0,

        max: 100,
      },

      summary: {
        type: String,
        default: "",
      },

      analysis: {
        type: [analysisSchema],
        default: [],
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

      /* =====================================================
         IMAGE INFORMATION
      ===================================================== */

      fileHash: {
        type: String,
        default: "",
      },

      fileName: {
        type: String,
        default: "",
      },

      mimeType: {
        type: String,
        default: "",
      },

      fileSize: {
        type: Number,
        default: 0,
      },

      imageFormat: {
        type: String,
        default: "",
      },

      metadata: {
        type: metadataSchema,
        default: undefined,
      },

      signals: {
        type: [signalSchema],
        default: [],
      },

      /* =====================================================
         VERIFICATION ID
      ===================================================== */

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

/* =========================================================
   EXPORT
========================================================= */

module.exports =
  mongoose.model(
    "Verification",
    verificationSchema
  );