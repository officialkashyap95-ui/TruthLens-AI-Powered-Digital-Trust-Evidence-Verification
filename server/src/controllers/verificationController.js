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


      /* ===================================================
         ANALYZE IMAGE
      =================================================== */

      const analysis =
        await analyzeImage({
          buffer:
            req.file.buffer,

          mimetype:
            req.file.mimetype,

          originalname:
            req.file.originalname,
        });


      /* ===================================================
         SAVE IMAGE VERIFICATION
      =================================================== */

      const verification =
        await Verification.create({

          userId:
            req.userId ||
            "development-user",

          type:
            "image",

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

          riskScore:
            analysis.riskScore,

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


      /* ===================================================
         ANALYZE TEXT
      =================================================== */

      const analysis =
        await analyzeContent({

          type,

          content:
            content.trim(),

          source:
            source || "",

        });


      /* ===================================================
         SAVE TEXT VERIFICATION
      =================================================== */

      const verification =
        await Verification.create({

          userId:
            req.userId ||
            "development-user",

          type:
            "text",

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
            analysis.verificationId ||
            generateVerificationId(),

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


    if (!verificationId) {

      return res.status(400).json({

        success: false,

        message:
          "Verification ID is required.",

      });
    }


    /* ===================================================
       FIND VERIFICATION
    =================================================== */

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
   GET VERIFICATION HISTORY
========================================================= */

const getVerificationHistory = async (
  req,
  res
) => {

  try {

    /*
     * For now the project uses:
     *
     * req.userId
     *
     * If authentication middleware provides
     * the Clerk user ID, that ID will be used.
     *
     * During development, we fall back to:
     *
     * development-user
     */

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


    /* ===================================================
       GET USER VERIFICATIONS
    =================================================== */

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
   GENERATE VERIFICATION ID
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
  getVerificationHistory,
};