const fs = require("fs");

const {
  analyzeImageWithGeminiVision,
} = require("../ai/geminiVisionService");

const {
  getVideoMetadata,
} = require("./videoMetadataService");

const {
  extractVideoFrames,
} = require("./videoFrameService");


/* =========================================================
   HELPERS
========================================================= */

const getNumericValues = (
  frameResults,
  field
) => {
  return frameResults
    .map((item) => {
      const value = Number(
        item?.result?.[field]
      );

      return Number.isFinite(value)
        ? value
        : null;
    })
    .filter(
      (value) => value !== null
    );
};


const average = (
  values
) => {
  if (!values.length) {
    return null;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
};


const roundScore = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return Math.round(value);
};


/* =========================================================
   DETERMINE VIDEO VERDICT
========================================================= */

const determineVerdict = ({
  risk,
  aiGeneration,
  confidence,
}) => {

  /*
   * Never treat unavailable scores as zero.
   */

  if (
    risk === null &&
    aiGeneration === null
  ) {
    return "Insufficient Evidence";
  }


  /*
   * Strong suspicious signal.
   */

  if (
    (risk !== null && risk >= 70) ||
    (
      aiGeneration !== null &&
      aiGeneration >= 70
    )
  ) {
    return "Suspicious";
  }


  /*
   * Strongly low-risk result.
   *
   * Require both scores to exist.
   */

  if (
    risk !== null &&
    aiGeneration !== null &&
    risk < 40 &&
    aiGeneration < 40 &&
    confidence >= 50
  ) {
    return "Likely Authentic";
  }


  /*
   * Everything in between is uncertain.
   */

  return "Insufficient Evidence";
};


/* =========================================================
   ANALYZE VIDEO
========================================================= */

const analyzeVideo = async ({
  buffer,
  originalname,
  mimetype,
}) => {

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "[Video] Starting TruthLens video analysis"
  );
  console.log(
    "========================================"
  );

  let frameResult = null;

  try {

    /* =====================================================
       1. VIDEO METADATA
    ===================================================== */

    const metadata =
      await getVideoMetadata(
        buffer
      );

    console.log(
      `[Video] Duration: ${metadata.duration.toFixed(2)} seconds`
    );

    console.log(
      `[Video] Resolution: ${metadata.width}x${metadata.height}`
    );

    console.log(
      `[Video] FPS: ${metadata.fps}`
    );

    console.log(
      `[Video] Codec: ${metadata.codec}`
    );


    /* =====================================================
       2. EXTRACT FRAMES
    ===================================================== */

    frameResult =
      await extractVideoFrames(
        buffer,
        metadata.duration
      );

    console.log(
      `[Video] Frames extracted: ${frameResult.frames.length}`
    );


    if (
      !frameResult.frames.length
    ) {
      throw new Error(
        "No frames could be extracted from the video."
      );
    }


    /* =====================================================
       3. ANALYZE EACH FRAME
    ===================================================== */

    const frameResults = [];


    for (
      const frame of
      frameResult.frames
    ) {

      console.log(
        `[Video] Analyzing frame ${frame.index}/${frameResult.frames.length}`
      );


      try {

        const frameBuffer =
          fs.readFileSync(
            frame.filePath
          );


        const result =
          await analyzeImageWithGeminiVision({
            buffer:
              frameBuffer,

            mimetype:
              "image/jpeg",

            originalname:
              frame.fileName,

            metadata: {
              videoName:
                originalname,

              frameIndex:
                frame.index,

              totalFrames:
                frameResult.frames.length,
            },

            forensicSignals:
              [],
          });


        frameResults.push({

          frameIndex:
            frame.index,

          fileName:
            frame.fileName,

          result,

        });


        console.log(
          `[Video] Frame ${frame.index} completed`
        );

        console.log(
          `[Video]   Classification: ${result.classification}`
        );

        console.log(
          `[Video]   Manipulation: ${result.manipulationScore}`
        );

        console.log(
          `[Video]   AI generation: ${result.aiGeneratedScore}`
        );

        console.log(
          `[Video]   Confidence: ${result.confidence}`
        );

      } catch (error) {

        console.error(
          `[Video] Frame ${frame.index} failed:`,
          error.message
        );


        frameResults.push({

          frameIndex:
            frame.index,

          fileName:
            frame.fileName,

          result:
            null,

          error:
            error.message,

        });

      }
    }


    /* =====================================================
       4. SUCCESSFUL FRAME RESULTS
    ===================================================== */

    const successfulResults =
      frameResults.filter(
        (item) =>
          item.result
      );


    console.log(
      `[Video] Successful frame analyses: ${successfulResults.length}/${frameResults.length}`
    );


    if (
      successfulResults.length === 0
    ) {
      throw new Error(
        "Unable to analyze any video frames."
      );
    }


    /* =====================================================
       5. EXTRACT SCORES
    ===================================================== */

    /*
     * IMPORTANT:
     *
     * These are the actual fields returned by
     * geminiVisionService.js
     */

    const confidenceValues =
      getNumericValues(
        successfulResults,
        "confidence"
      );


    const manipulationValues =
      getNumericValues(
        successfulResults,
        "manipulationScore"
      );


    const aiGenerationValues =
      getNumericValues(
        successfulResults,
        "aiGeneratedScore"
      );


    const authenticityValues =
      getNumericValues(
        successfulResults,
        "visualAuthenticityScore"
      );


    /* =====================================================
       6. CALCULATE AGGREGATES
    ===================================================== */

    const averageConfidence =
      roundScore(
        average(
          confidenceValues
        )
      );


    const averageManipulation =
      roundScore(
        average(
          manipulationValues
        )
      );


    const averageAIGeneration =
      roundScore(
        average(
          aiGenerationValues
        )
      );


    const averageAuthenticity =
      roundScore(
        average(
          authenticityValues
        )
      );


    /*
     * Overall risk currently uses the stronger of:
     *
     * - manipulation risk
     * - AI generation risk
     *
     * Later we will replace this with a proper
     * multi-signal fusion engine.
     */

    let risk = null;


    if (
      averageManipulation !== null &&
      averageAIGeneration !== null
    ) {

      risk =
        Math.max(
          averageManipulation,
          averageAIGeneration
        );

    } else if (
      averageManipulation !== null
    ) {

      risk =
        averageManipulation;

    } else if (
      averageAIGeneration !== null
    ) {

      risk =
        averageAIGeneration;

    }


    /* =====================================================
       7. DETERMINE VERDICT
    ===================================================== */

    const verdict =
      determineVerdict({
        risk,

        aiGeneration:
          averageAIGeneration,

        confidence:
          averageConfidence || 0,
      });


    /* =====================================================
       8. LOG FINAL RESULT
    ===================================================== */

    console.log("");
    console.log(
      "========== VIDEO RESULT =========="
    );

    console.log(
      "Verdict:",
      verdict
    );

    console.log(
      "Confidence:",
      averageConfidence
    );

    console.log(
      "Manipulation:",
      averageManipulation
    );

    console.log(
      "AI Generation:",
      averageAIGeneration
    );

    console.log(
      "Authenticity:",
      averageAuthenticity
    );

    console.log(
      "Overall Risk:",
      risk
    );

    console.log(
      "Frames:",
      successfulResults.length
    );

    console.log(
      "=================================="
    );


    /* =====================================================
       9. RETURN RESULT
    ===================================================== */

    return {

      verdict,

      confidence:
        averageConfidence,

      risk,

      aiGeneration:
        averageAIGeneration,

      manipulationScore:
        averageManipulation,

      visualAuthenticityScore:
        averageAuthenticity,

      metadata: {

        duration:
          metadata.duration,

        width:
          metadata.width,

        height:
          metadata.height,

        fps:
          metadata.fps,

        codec:
          metadata.codec,

        format:
          metadata.format,

        framesAnalyzed:
          successfulResults.length,

        totalFrames:
          frameResults.length,

      },

      frames:
        frameResults,

    };

  } finally {

    /* =====================================================
       10. ALWAYS CLEAN TEMP FILES
    ===================================================== */

    if (
      frameResult?.tempDir
    ) {

      try {

        fs.rmSync(
          frameResult.tempDir,
          {
            recursive: true,
            force: true,
          }
        );

        console.log(
          "[Video] Temporary files cleaned."
        );

      } catch (cleanupError) {

        console.error(
          "[Video] Temporary file cleanup failed:",
          cleanupError.message
        );

      }
    }
  }
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  analyzeVideo,
};