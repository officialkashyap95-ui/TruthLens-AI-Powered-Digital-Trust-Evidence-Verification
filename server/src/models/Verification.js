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
   IMAGE + VIDEO METADATA SCHEMA
========================================================= */

const metadataSchema =
  new mongoose.Schema(
    {
      /* =========================
         GENERAL FILE INFORMATION
      ========================= */

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

      sceneChanges: {
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


      /* =====================================================
         VIDEO EVIDENCE QUALITY
      ===================================================== */

      /*
       * IMPORTANT:
       *
       * This used to be Number.
       *
       * The video analysis service returns:
       *
       * "Limited"
       * "Good"
       * "Strong"
       */
      evidenceQuality: {
        type: String,

        enum: [
          "Limited",
          "Good",
          "Strong",
        ],

        default: "Limited",
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
   VIDEO FRAME SCHEMA
========================================================= */

const videoFrameSchema =
  new mongoose.Schema(
    {
      frameIndex: {
        type: Number,
        required: true,
      },

      fileName: {
        type: String,
        default: "",
      },

      timestampSeconds: {
        type: Number,
        default: 0,
      },

      timestamp: {
        type: String,
        default: "",
      },

      frameRisk: {
        type: Number,
        default: null,
      },

      suspicious: {
        type: Boolean,
        default: false,
      },

      highRisk: {
        type: Boolean,
        default: false,
      },

      frameConfidence: {
        type: Number,
        default: null,
      },

      isSceneChange: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );


/* =========================================================
   SUSPICIOUS FRAME SCHEMA
========================================================= */

const suspiciousFrameSchema =
  new mongoose.Schema(
    {
      frameIndex: {
        type: Number,
        required: true,
      },

      fileName: {
        type: String,
        default: "",
      },

      timestampSeconds: {
        type: Number,
        default: 0,
      },

      timestamp: {
        type: String,
        default: "",
      },

      frameRisk: {
        type: Number,
        default: null,
      },

      manipulationScore: {
        type: Number,
        default: null,
      },

      aiGeneratedScore: {
        type: Number,
        default: null,
      },

      confidence: {
        type: Number,
        default: null,
      },

      isSceneChange: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );


/* =========================================================
   SUSPICIOUS SEGMENT FRAME SCHEMA
========================================================= */

const suspiciousSegmentFrameSchema =
  new mongoose.Schema(
    {
      frameIndex: {
        type: Number,
        required: true,
      },

      timestamp: {
        type: String,
        default: "",
      },

      timestampSeconds: {
        type: Number,
        default: 0,
      },

      frameRisk: {
        type: Number,
        default: null,
      },

      confidence: {
        type: Number,
        default: null,
      },

      isSceneChange: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );


/* =========================================================
   SUSPICIOUS SEGMENT SCHEMA
========================================================= */

const suspiciousSegmentSchema =
  new mongoose.Schema(
    {
      segmentIndex: {
        type: Number,
        required: true,
      },

      startTimeSeconds: {
        type: Number,
        default: 0,
      },

      endTimeSeconds: {
        type: Number,
        default: 0,
      },

      startTimestamp: {
        type: String,
        default: "",
      },

      endTimestamp: {
        type: String,
        default: "",
      },

      durationSeconds: {
        type: Number,
        default: 0,
      },

      framesCount: {
        type: Number,
        default: 0,
      },

      averageRisk: {
        type: Number,
        default: null,
      },

      peakRisk: {
        type: Number,
        default: null,
      },

      averageConfidence: {
        type: Number,
        default: null,
      },

      severity: {
        type: String,

        enum: [
          "Moderate",
          "Elevated",
          "High",
        ],

        default: "Moderate",
      },

      frames: {
        type: [
          suspiciousSegmentFrameSchema,
        ],

        default: [],
      },
    },
    {
      _id: false,
    }
  );


/* =========================================================
   VIDEO ANALYSIS SCHEMA
========================================================= */

const videoAnalysisSchema =
  new mongoose.Schema(
    {
      /*
       * Overall frame-risk statistics.
       */

      averageRisk: {
        type: Number,
        default: null,
      },

      peakRisk: {
        type: Number,
        default: null,
      },

      fusedRisk: {
        type: Number,
        default: null,
      },


      /*
       * Suspicious frame statistics.
       */

      suspiciousFrameRatio: {
        type: Number,
        default: 0,
      },

      suspiciousFramePercentage: {
        type: Number,
        default: 0,
      },

      suspiciousFrameCount: {
        type: Number,
        default: 0,
      },

      suspiciousSegmentCount: {
        type: Number,
        default: 0,
      },


      /*
       * Evidence quality.
       */

      evidenceQuality: {
        type: String,

        enum: [
          "Limited",
          "Good",
          "Strong",
        ],

        default: "Limited",
      },


      /*
       * All analyzed frames.
       */

      frames: {
        type: [
          videoFrameSchema,
        ],

        default: [],
      },


      /*
       * Strongest suspicious frames.
       */

      suspiciousFrames: {
        type: [
          suspiciousFrameSchema,
        ],

        default: [],
      },


      /*
       * Temporally connected suspicious regions.
       */

      suspiciousSegments: {
        type: [
          suspiciousSegmentSchema,
        ],

        default: [],
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
        type: String,

        enum: [
          "Limited",
          "Good",
          "Strong",
        ],

        default: "Limited",
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


      /* =====================================================
         VERIFICATION TYPE
      ===================================================== */

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


      /* =====================================================
         CONTENT
      ===================================================== */

      content: {
        type: String,
        required: true,
      },

      source: {
        type: String,
        default: "",
      },


      /* =====================================================
         FILE
      ===================================================== */

      file: {
        type: fileSchema,
        default: undefined,
      },


      /* =====================================================
         VISUAL ANALYSIS
      ===================================================== */

      visualAnalysis: {
        type: visualAnalysisSchema,
        default: undefined,
      },


      /* =====================================================
         VIDEO ANALYSIS
      ===================================================== */

      videoAnalysis: {
        type: videoAnalysisSchema,
        default: undefined,
      },


      /* =====================================================
         FUSION
      ===================================================== */

      fusion: {
        type: fusionSchema,
        default: undefined,
      },


      /* =====================================================
         FINAL RESULT
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


      /* =====================================================
         ANALYSIS
      ===================================================== */

      analysis: {
        type: [
          analysisSchema,
        ],

        default: [],
      },


      /* =====================================================
         EVIDENCE
      ===================================================== */

      evidence: {
        type: [
          evidenceSchema,
        ],

        default: [],
      },


      /*
       * IMPORTANT:
       *
       * This is for external sources/evidence.
       * It is NOT the number of video frames.
       */
      sourcesAnalyzed: {
        type: Number,
        default: 0,
      },


      /*
       * Actual processing duration.
       */
      processingTime: {
        type: String,
        default: "",
      },


      /* =====================================================
         FILE INFORMATION
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


      /* =====================================================
         METADATA
      ===================================================== */

      metadata: {
        type: metadataSchema,
        default: undefined,
      },


      /* =====================================================
         SIGNALS
      ===================================================== */

      signals: {
        type: [
          signalSchema,
        ],

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