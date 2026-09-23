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

      category: {
        type: String,
        default: "",
      },

      score: {
        type: Number,
        default: 0,
      },

      reliability: {
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

      /* =========================
         IMAGE METADATA
      ========================= */

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

      /* =========================
         VIDEO METADATA
      ========================= */

      duration: {
        type: Number,
        default: null,
      },

      width: {
        type: Number,
        default: null,
      },

      height: {
        type: Number,
        default: null,
      },

      fps: {
        type: Number,
        default: null,
      },

      codec: {
        type: String,
        default: "",
      },

      framesAnalyzed: {
        type: Number,
        default: 0,
      },

      totalFrames: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
 FILE SCHEMA
========================================================= */

const fileSchema =
  new mongoose.Schema(
    {
      originalName: {
        type: String,
        default: "",
      },

      mimeType: {
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

      format: {
        type: String,
        default: "",
      },

      sha256: {
        type: String,
        default: "",
      },
    },

    {
      _id: false,
    }
  );


/* =========================================================
   VISUAL ANALYSIS SCHEMA
========================================================= */

const visualAnalysisSchema =
  new mongoose.Schema(
    {
      available: {
        type: Boolean,
        default: false,
      },

      classification: {
        type: String,
        default: "UNVERIFIED",
      },

      aiGeneratedScore: {
        type: Number,
        default: null,
      },

      manipulationScore: {
        type: Number,
        default: null,
      },

      visualAuthenticityScore: {
        type: Number,
        default: null,
      },

      confidence: {
        type: Number,
        default: 0,
      },

      verdict: {
        type: String,
        default:
          "Insufficient Evidence",
      },

      findings: {
        type: [String],
        default: [],
      },

      manipulationIndicators: {
        type: [String],
        default: [],
      },

      authenticityIndicators: {
        type: [String],
        default: [],
      },

      limitations: {
        type: [String],
        default: [],
      },

      evidenceQuality: {
        type: Number,
        default: 0,
      },

      framesAnalyzed: {
        type: Number,
        default: 0,
      },

      totalFrames: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: false,
    }
  );


/* =========================================================
   FUSION SCHEMA
========================================================= */

const fusionSchema =
  new mongoose.Schema(
    {
      method: {
        type: String,
        default: "",
      },

      forensicRisk: {
        type: Number,
        default: null,
      },

      visualRisk: {
        type: Number,
        default: null,
      },

      manipulationRisk: {
        type: Number,
        default: null,
      },

      aiGenerationRisk: {
        type: Number,
        default: null,
      },

      evidenceQuality: {
        type: Number,
        default: 0,
      },

      independentSignals: {
        type: Number,
        default: 0,
      },

      confidence: {
        type: Number,
        default: 0,
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
      file: {
        type: fileSchema,
        default: undefined,
      },

      visualAnalysis: {
        type: visualAnalysisSchema,
        default: undefined,
      },

      fusion: {
        type: fusionSchema,
        default: undefined,
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