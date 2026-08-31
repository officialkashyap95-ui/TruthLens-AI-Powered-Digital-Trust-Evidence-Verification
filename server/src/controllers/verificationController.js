const Verification = require("../models/Verification");
const {
  analyzeContent,
} = require("../services/verificationService");

const createVerification = async (req, res) => {
  try {
    const { type, content } = req.body;

    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: "Type and content are required",
      });
    }

    const analysis = await analyzeContent({
      type,
      content,
    });

    const verification = await Verification.create({
      userId: req.userId || "development-user",
      type,
      content,

      verdict: analysis.verdict,
      confidence: analysis.confidence,
      summary: analysis.summary,

      evidence: analysis.evidence,

      sourcesAnalyzed: analysis.sourcesAnalyzed,
      processingTime: analysis.processingTime,

      verificationId: analysis.verificationId,
    });

    return res.status(201).json({
      success: true,
      message: "Verification created successfully",
      verification,
    });
  } catch (error) {
    console.error("Verification creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create verification",
    });
  }
};

module.exports = {
  createVerification,
};