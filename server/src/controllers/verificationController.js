const Verification = require("../models/Verification");
const UserSettings = require("../models/UserSettings");

const {
  analyzeContent,
} = require("../services/verificationService");

const {
  analyzeImage,
} = require("../services/image/imageVerificationService");

const {
  analyzeImageWithGeminiVision,
} = require("../services/ai/geminiVisionService");

/* =========================================================
   GET USER SETTINGS
========================================================= */

const getUserSettings = async (userId) => {
  let settings =
    await UserSettings.findOne({
      userId,
    });

  if (!settings) {
    settings =
      await UserSettings.create({
        userId,
      });
  }

  return settings;
};


/* =========================================================
   SETTINGS RESPONSE
========================================================= */

const formatSettings = (
  settings
) => {
  return {
    saveHistory:
      settings.saveHistory,

    showConfidence:
      settings.showConfidence,

    showEvidence:
      settings.showEvidence,

    verificationCompleted:
      settings.verificationCompleted,

    verificationErrors:
      settings.verificationErrors,

    theme:
      settings.theme,
  };
};


/* =========================================================
   GENERATE VERIFICATION ID
========================================================= */

const generateVerificationId = () => {
  const year =
    new Date().getFullYear();

  const randomNumber =
    Math.floor(
      1000 +
      Math.random() * 9000
    );

  return `TL-${year}-${randomNumber}`;
};


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
       BASIC VALIDATION
    ===================================================== */

    if (!type) {
      return res.status(400).json({
        success: false,

        message:
          "Verification type is required.",
      });
    }


    /* =====================================================
       USER + SETTINGS
    ===================================================== */

    const userId =
      req.userId ||
      "development-user";

    const settings =
      await getUserSettings(
        userId
      );


    /* =====================================================
       IMAGE VERIFICATION
    ===================================================== */

    if (type === "image") {

      /* ---------------------------------------------------
         FILE VALIDATION
      --------------------------------------------------- */

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


      /* ---------------------------------------------------
         ANALYZE IMAGE
      --------------------------------------------------- */

      const analysis =
        await analyzeImage({
          buffer:
            req.file.buffer,

          mimetype:
            req.file.mimetype,

          originalname:
            req.file.originalname,

          analyzeVision:
            analyzeImageWithGeminiVision,
        });


      /* ---------------------------------------------------
         GENERATE ID
      --------------------------------------------------- */

      const verificationId =
        analysis.verificationId ||
        generateVerificationId();


      /* ---------------------------------------------------
         BUILD VERIFICATION RESULT
         
         IMPORTANT:
         This object is created regardless of
         saveHistory.
      --------------------------------------------------- */

      const verificationData = {
        userId,

        type: "image",

        content:
          req.file.originalname,

        source:
          source || "",

        verdict:
          analysis.verdict,

        confidence:
          analysis.confidence,

        riskScore:
          analysis.riskScore || 0,

        summary:
          analysis.summary,

        analysis:
          analysis.analysis || [],

        evidence:
          analysis.evidence || [],

        sourcesAnalyzed:
          analysis.sourcesAnalyzed || 0,

        processingTime:
          analysis.processingTime || "",

        verificationId,

        fileHash:
          analysis.file?.sha256,

        fileName:
          analysis.file?.originalName,

        mimeType:
          analysis.file?.mimeType,

        fileSize:
          analysis.file?.sizeBytes,

        imageFormat:
          analysis.file?.format,

        file:
          analysis.file,

        metadata:
          analysis.metadata,

        signals:
          analysis.signals,

        visualAnalysis:
          analysis.visualAnalysis,

        fusion:
          analysis.fusion,
      };


      /* ---------------------------------------------------
         SAVE ONLY IF ENABLED
      --------------------------------------------------- */

      let verification =
        verificationData;


      if (settings.saveHistory) {

        verification =
          await Verification.create(
            verificationData
          );

        console.log(
          "Image verification saved:",
          verification.verificationId
        );

      } else {

        console.log(
          "Image verification analyzed but history saving is disabled."
        );

      }


      /* ---------------------------------------------------
         IMAGE RESPONSE
      --------------------------------------------------- */

      return res.status(201).json({

        success: true,

        message:
          settings.saveHistory
            ? "Image verification created successfully."
            : "Image verification completed successfully. History saving is disabled.",

        /*
         * IMPORTANT:
         * Never return null here.
         *
         * The frontend needs the verification
         * result even when history is disabled.
         */

        verification,

        settings:
          formatSettings(
            settings
          ),
      });
    }


    /* =====================================================
       TEXT VERIFICATION
    ===================================================== */

    if (type === "text") {

      /* ---------------------------------------------------
         CONTENT VALIDATION
      --------------------------------------------------- */

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


      /* ---------------------------------------------------
         ANALYZE TEXT
      --------------------------------------------------- */

      const analysis =
        await analyzeContent({
          type: "text",

          content:
            content.trim(),

          source:
            source || "",
        });


      /* ---------------------------------------------------
         GENERATE ID
      --------------------------------------------------- */

      const verificationId =
        analysis.verificationId ||
        generateVerificationId();


      /* ---------------------------------------------------
         BUILD VERIFICATION RESULT
         
         IMPORTANT:
         This object is created regardless of
         saveHistory.
      --------------------------------------------------- */

      const verificationData = {
        userId,

        type: "text",

        content:
          content.trim(),

        source:
          source || "",

        verdict:
          analysis.verdict,

        confidence:
          analysis.confidence,

        riskScore:
          analysis.riskScore || 0,

        summary:
          analysis.summary,

        analysis:
          analysis.analysis || [],

        evidence:
          analysis.evidence || [],

        sourcesAnalyzed:
          analysis.sourcesAnalyzed || 0,

        processingTime:
          analysis.processingTime || "",

        verificationId,
      };


      /* ---------------------------------------------------
         SAVE ONLY IF ENABLED
      --------------------------------------------------- */

      let verification =
        verificationData;


      if (settings.saveHistory) {

        verification =
          await Verification.create(
            verificationData
          );

        console.log(
          "Text verification saved:",
          verification.verificationId
        );

      } else {

        console.log(
          "Text verification analyzed but history saving is disabled."
        );

      }


      /* ---------------------------------------------------
         TEXT RESPONSE
      --------------------------------------------------- */

      return res.status(201).json({

        success: true,

        message:
          settings.saveHistory
            ? "Text verification created successfully."
            : "Text verification completed successfully. History saving is disabled.",

        /*
         * IMPORTANT:
         * Return the analysis result even when
         * saveHistory is false.
         */

        verification,

        settings:
          formatSettings(
            settings
          ),
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
   GET SINGLE VERIFICATION
========================================================= */

const getVerification = async (
  req,
  res
) => {
  try {

    const {
      verificationId,
    } = req.params;


    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!verificationId) {
      return res.status(400).json({
        success: false,

        message:
          "Verification ID is required.",
      });
    }


    /* -------------------------------------------------------
       USER
    ------------------------------------------------------- */

    const userId =
      req.userId ||
      "development-user";


    /* -------------------------------------------------------
       USER-SPECIFIC QUERY
    ------------------------------------------------------- */

    const verification =
      await Verification.findOne({
        verificationId,

        userId,
      }).lean();


    /* -------------------------------------------------------
       NOT FOUND
    ------------------------------------------------------- */

    if (!verification) {
      return res.status(404).json({
        success: false,

        message:
          "Verification not found.",
      });
    }


    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

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
   GET VERIFICATION HISTORY
========================================================= */

const getVerificationHistory = async (
  req,
  res
) => {
  try {

    const userId =
      req.userId ||
      "development-user";


    console.log("");

    console.log(
      "Loading verification history..."
    );

    console.log(
      "User ID:",
      userId
    );


    /* -------------------------------------------------------
       USER-SPECIFIC HISTORY
    ------------------------------------------------------- */

    const verifications =
      await Verification.find({
        userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();


    console.log(
      "History records found:",
      verifications.length
    );


    return res.status(200).json({

      success: true,

      message:
        "Verification history retrieved successfully.",

      count:
        verifications.length,

      verifications,
    });

  } catch (error) {

    console.error(
      "Get verification history error:"
    );

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to retrieve verification history.",
    });
  }
};


/* =========================================================
   DELETE VERIFICATION HISTORY
========================================================= */

const deleteVerificationHistory = async (
  req,
  res
) => {
  try {

    const userId =
      req.userId ||
      "development-user";


    console.log("");

    console.log(
      "Deleting verification history..."
    );

    console.log(
      "User ID:",
      userId
    );


    /* -------------------------------------------------------
       DELETE ONLY CURRENT USER'S RECORDS
    ------------------------------------------------------- */

    const result =
      await Verification.deleteMany({
        userId,
      });


    console.log(
      "History records deleted:",
      result.deletedCount
    );


    return res.status(200).json({

      success: true,

      message:
        "Verification history cleared successfully.",

      deletedCount:
        result.deletedCount || 0,
    });

  } catch (error) {

    console.error(
      "Delete verification history error:"
    );

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to clear verification history.",
    });
  }
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  createVerification,

  getVerification,

  getVerificationHistory,

  deleteVerificationHistory,
};