const fs = require("fs");
const path = require("path");
const os = require("os");

const {
  analyzeImageWithGeminiVision,
} = require("../ai/geminiVisionService");

const {
  getVideoMetadata,
} = require("./videoMetadataService");

const {
  extractVideoFrames,
} = require("./videoFrameService");

const analyzeVideo = async ({
  buffer,
  originalname,
  mimetype,
}) => {
  console.log(`[Video] Starting analysis: ${originalname}`);

  // --------------------------------------------------
  // 1. Get video metadata
  // --------------------------------------------------

  const metadata = await getVideoMetadata(buffer);

  console.log(
    `[Video] Duration: ${metadata.duration.toFixed(2)} seconds`
  );

  console.log(
    `[Video] Resolution: ${metadata.width}x${metadata.height}`
  );

  console.log(`[Video] FPS: ${metadata.fps}`);

  // --------------------------------------------------
  // 2. Extract frames
  // --------------------------------------------------

  const frameResult = await extractVideoFrames(
    buffer,
    metadata.duration
  );

  console.log(
    `[Video] Frames extracted: ${frameResult.frames.length}`
  );

  // --------------------------------------------------
  // 3. Analyze each frame using existing AI service
  // --------------------------------------------------

  const frameResults = [];

  for (const frame of frameResult.frames) {
    console.log(
      `[Video] Analyzing frame ${frame.index}/${frameResult.frames.length}`
    );

    const frameBuffer = fs.readFileSync(frame.filePath);

    try {
      const result = await analyzeImageWithGeminiVision({
        buffer: frameBuffer,
        mimetype: "image/jpeg",
        originalname: frame.fileName,
        metadata: {
          videoName: originalname,
          frameIndex: frame.index,
          totalFrames: frameResult.frames.length,
        },
        forensicSignals: [],
      });

      frameResults.push({
        frameIndex: frame.index,
        fileName: frame.fileName,
        result,
      });

      console.log(
        `[Video] Frame ${frame.index} analyzed successfully`
      );
    } catch (error) {
      console.error(
        `[Video] Frame ${frame.index} analysis failed:`,
        error.message
      );

      frameResults.push({
        frameIndex: frame.index,
        fileName: frame.fileName,
        result: null,
        error: error.message,
      });
    }
  }

  // --------------------------------------------------
  // 4. Calculate basic combined result
  // --------------------------------------------------

  const successfulResults = frameResults.filter(
    (item) => item.result
  );

  if (successfulResults.length === 0) {
    throw new Error(
      "Unable to analyze any video frames."
    );
  }

  const confidenceValues = successfulResults
    .map((item) => Number(item.result.confidence))
    .filter((value) => Number.isFinite(value));

  const riskValues = successfulResults
    .map((item) => Number(item.result.risk))
    .filter((value) => Number.isFinite(value));

  const aiGenerationValues = successfulResults
    .map((item) =>
      Number(item.result.aiGeneration)
    )
    .filter((value) => Number.isFinite(value));

  const average = (values) => {
    if (!values.length) return 0;

    return (
      values.reduce((sum, value) => sum + value, 0) /
      values.length
    );
  };

  const averageConfidence = Math.round(
    average(confidenceValues)
  );

  const averageRisk = Math.round(
    average(riskValues)
  );

  const averageAIGeneration = Math.round(
    average(aiGenerationValues)
  );

  // --------------------------------------------------
  // 5. Determine basic verdict
  // --------------------------------------------------

  let verdict = "Insufficient Evidence";

  if (averageRisk >= 70 || averageAIGeneration >= 70) {
    verdict = "Suspicious";
  } else if (averageRisk < 40 && averageAIGeneration < 40) {
    verdict = "Likely Authentic";
  }

  // --------------------------------------------------
  // 6. Clean temporary files
  // --------------------------------------------------

  try {
    fs.rmSync(frameResult.tempDir, {
      recursive: true,
      force: true,
    });
  } catch (cleanupError) {
    console.error(
      "[Video] Temporary file cleanup failed:",
      cleanupError.message
    );
  }

  // --------------------------------------------------
  // 7. Return video analysis
  // --------------------------------------------------

  return {
    verdict,

    confidence: averageConfidence,

    risk: averageRisk,

    aiGeneration: averageAIGeneration,

    metadata: {
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      fps: metadata.fps,
      codec: metadata.codec,
      format: metadata.format,
      framesAnalyzed: successfulResults.length,
      totalFrames: frameResults.length,
    },

    frames: frameResults,
  };
};

module.exports = {
  analyzeVideo,
};