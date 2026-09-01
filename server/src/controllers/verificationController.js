const Verification =
  require("../models/Verification");

const {
  analyzeContent,
} = require("../services/verificationService");


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

    /*
     * Validate required fields.
     */
    if (
      !type ||
      !content
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Type and content are required",
      });

    }

    /*
     * Text only for current MVP.
     */
    if (
      type !== "text"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Currently only text verification is supported.",
      });

    }

    console.log(
      "Starting verification..."
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
     * Run verification engine.
     */
    const analysis =
      await analyzeContent({
        type,
        content,
        source,
      });

    /*
     * Save result to MongoDB.
     */
    const verification =
      await Verification.create({

        userId:
          req.userId ||
          "development-user",

        type,

        content,

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
      "Verification saved:",
      verification.verificationId
    );

    return res.status(201).json({

      success: true,

      message:
        "Verification created successfully",

      verification,

    });

  } catch (error) {

    console.error(
      "Verification creation error:"
    );

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to create verification",

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

    /*
     * Validate ID.
     */
    if (
      !verificationId
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Verification ID is required",

      });

    }

    /*
     * Find verification.
     */
    const verification =
      await Verification.findOne({
        verificationId,
      }).lean();

    /*
     * Not found.
     */
    if (!verification) {

      return res.status(404).json({

        success: false,

        message:
          "Verification not found",

      });

    }

    /*
     * Return verification.
     */
    return res.status(200).json({

      success: true,

      message:
        "Verification retrieved successfully",

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
        "Failed to retrieve verification",

    });

  }
};


module.exports = {
  createVerification,
  getVerification,
};