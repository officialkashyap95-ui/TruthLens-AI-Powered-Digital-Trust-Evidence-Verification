const Verification =
  require("../models/Verification");

const {
  analyzeContent,
} = require("../services/verificationService");

const {
  analyzeImage,
} = require("../services/image/imageVerificationService");

/* =========================================================
   CREATE VERIFICATION
========================================================= */

const createVerification = async (
  req,
  res
) => {
  try {
    const {
      type,
      content,
      source,
    } = req.body;

    /* =====================================================
       BASIC TYPE VALIDATION
    ===================================================== */

    if (!type) {
      return res.status(400).json({
        success: false,
        message:
          "Verification type is required.",
      });
    }

    /* =====================================================
       IMAGE VERIFICATION
    ===================================================== */

    if (type === "image") {
      /*
       * Multer should place the uploaded
       * image inside req.file.
       */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload an image.",
        });
      }

      console.log("");
      console.log(
        "Starting image verification..."
      );

      console.log(
        "Filename:",
        req.file.originalname
      );

      console.log(
        "MIME type:",
        req.file.mimetype
      );

      console.log(
        "Size:",
        (
          req.file.size /
          1024 /
          1024
        ).toFixed(2),
        "MB"
      );

      /*
       * Analyze uploaded image.
       */

      const analysis =
        await analyzeImage({
          buffer:
            req.file.buffer,

          mimetype:
            req.file.mimetype,

          originalname:
            req.file.originalname,
        });

      /*
       * Save verification.
       *
       * content is required by the current
       * MongoDB schema, so we store the
       * filename for image verification.
       */

      const verification =
        await Verification.create({
          userId:
            req.userId ||
            "development-user",

          type: "image",

          content:
            req.file.originalname,

          source:
            source || "",

          verdict:
            analysis.verdict,

          confidence:
            analysis.confidence,

          summary:
            analysis.summary,

          analysis:
            analysis.analysis || [],

          evidence:
            analysis.evidence || [],

          sourcesAnalyzed:
            analysis.sourcesAnalyzed ||
            0,

          processingTime:
            analysis.processingTime ||
            "",

          verificationId:
            generateVerificationId(),

          /*
           * Image-specific fields.
           */

          riskScore:
            analysis.riskScore,

          fileHash:
            analysis.file.sha256,

          fileName:
            analysis.file.originalName,

          mimeType:
            analysis.file.mimeType,

          fileSize:
            analysis.file.sizeBytes,

          imageFormat:
            analysis.file.format,

          metadata:
            analysis.metadata,

          signals:
            analysis.signals,
        });

      console.log(
        "Image verification saved:",
        verification.verificationId
      );

      return res.status(201).json({
        success: true,

        message:
          "Image verification created successfully.",

        verification,
      });
    }

    /* =====================================================
       TEXT VERIFICATION
    ===================================================== */

    if (type === "text") {
      if (
        !content ||
        !content.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Text content is required.",
        });
      }

      console.log("");
      console.log(
        "Starting text verification..."
      );

      console.log(
        "Content:",
        content
      );

      console.log(
        "Source:",
        source ||
          "No source provided"
      );

      /*
       * Run existing text verification engine.
       */

      const analysis =
        await analyzeContent({
          type,
          content:
            content.trim(),
          source:
            source || "",
        });

      /*
       * Save result.
       */

      const verification =
        await Verification.create({
          userId:
            req.userId ||
            "development-user",

          type: "text",

          content:
            content.trim(),

          source:
            source || "",

          verdict:
            analysis.verdict,

          confidence:
            analysis.confidence,

          summary:
            analysis.summary,

          analysis:
            analysis.analysis || [],

          evidence:
            analysis.evidence || [],

          sourcesAnalyzed:
            analysis.sourcesAnalyzed ||
            0,

          processingTime:
            analysis.processingTime ||
            "",

          verificationId:
            analysis.verificationId,
        });

      console.log(
        "Text verification saved:",
        verification.verificationId
      );

      return res.status(201).json({
        success: true,

        message:
          "Text verification created successfully.",

        verification,
      });
    }

    /* =====================================================
       OTHER TYPES
    ===================================================== */

    return res.status(400).json({
      success: false,

      message:
        "Video and document verification are not implemented yet.",
    });
  } catch (error) {
    console.error("");

    console.error(
      "Verification creation error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to create verification.",
    });
  }
};

/* =========================================================
   GET VERIFICATION
========================================================= */

const getVerification = async (
  req,
  res
) => {
  try {
    const {
      verificationId,
    } = req.params;

    if (!verificationId) {
      return res.status(400).json({
        success: false,

        message:
          "Verification ID is required.",
      });
    }

    const verification =
      await Verification.findOne({
        verificationId,
      }).lean();

    if (!verification) {
      return res.status(404).json({
        success: false,

        message:
          "Verification not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Verification retrieved successfully.",

      verification,
    });
  } catch (error) {
    console.error(
      "Get verification error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to retrieve verification.",
    });
  }
};

/* =========================================================
   VERIFICATION ID
========================================================= */

const generateVerificationId = () => {
  const year =
    new Date().getFullYear();

  const randomNumber =
    Math.floor(
      1000 +
        Math.random() *
          9000
    );

  return `TL-${year}-${randomNumber}`;
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  createVerification,
  getVerification,
};