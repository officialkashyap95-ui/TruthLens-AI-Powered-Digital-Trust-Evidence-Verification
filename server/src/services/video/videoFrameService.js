const fs = require("fs");
const path = require("path");
const os = require("os");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

/**
 * Maximum number of frames that will be analyzed.
 *
 * Keeping this bounded prevents very long videos from creating
 * hundreds/thousands of expensive AI vision requests.
 */
const getTargetFrameCount = (duration) => {
  if (duration <= 10) {
    return 6;
  }

  if (duration <= 30) {
    return 8;
  }

  if (duration <= 60) {
    return 12;
  }

  return 15;
};

/**
 * Generate evenly distributed timestamps.
 *
 * We avoid the exact first and last frame because:
 * - the first frame can sometimes be black/faded
 * - the last frame can sometimes be a transition/end card
 *
 * Example:
 * duration = 10 seconds
 * count = 6
 *
 * timestamps:
 * 1.43, 2.86, 4.29, 5.71, 7.14, 8.57
 */
const generateTimestamps = (duration, frameCount) => {
  if (!Number.isFinite(duration) || duration <= 0) {
    return [];
  }

  if (frameCount <= 1) {
    return [Math.max(duration / 2, 0)];
  }

  const timestamps = [];

  for (let i = 1; i <= frameCount; i += 1) {
    const timestamp = (duration * i) / (frameCount + 1);

    timestamps.push(Number(timestamp.toFixed(3)));
  }

  return timestamps;
};

/**
 * Convert seconds into a human-readable timestamp.
 *
 * Example:
 * 5.63 -> "00:05.63"
 * 65.42 -> "01:05.42"
 */
const formatTimestamp = (seconds) => {
  const safeSeconds = Math.max(Number(seconds) || 0, 0);

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds - minutes * 60;

  return `${String(minutes).padStart(2, "0")}:${remainingSeconds
    .toFixed(2)
    .padStart(5, "0")}`;
};

/**
 * Extract a single frame from a video at a specific timestamp.
 */
const extractSingleFrame = (videoPath, outputPath, timestamp) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      /**
       * Seeking before decoding keeps extraction considerably faster
       * than decoding the entire video from the beginning.
       */
      .inputOptions([
        "-ss",
        String(timestamp),
      ])
      .outputOptions([
        "-frames:v",
        "1",
        "-q:v",
        "2",
        "-threads",
        "1",
      ])
      .output(outputPath)
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      })
      .run();
  });
};

/**
 * Remove a temporary directory safely.
 */
const removeTempDirectory = (tempDir) => {
  if (!tempDir) {
    return;
  }

  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, {
        recursive: true,
        force: true,
      });
    }
  } catch (error) {
    console.error(
      "[Video Frames] Failed to remove temporary directory:",
      error.message
    );
  }
};

/**
 * Extract useful frames from a video.
 *
 * The returned frame objects intentionally preserve:
 *
 * - index
 * - fileName
 * - filePath
 * - timestampSeconds
 * - timestamp
 *
 * This allows the rest of TruthLens to tell the user WHERE in the
 * video a suspicious frame was detected.
 *
 * Existing callers can continue using:
 *
 *     frame.filePath
 *
 * without any changes.
 */
const extractVideoFrames = async (videoBuffer, duration) => {
  let tempDir = null;

  try {
    if (!Buffer.isBuffer(videoBuffer) || videoBuffer.length === 0) {
      throw new Error("Invalid or empty video buffer.");
    }

    const numericDuration = Number(duration);

    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      throw new Error("Invalid video duration.");
    }

    /*
     * Create an isolated temporary directory for this verification.
     *
     * Example:
     * /tmp/truthlens-video-AbCd12/
     */
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "truthlens-video-")
    );

    const videoPath = path.join(tempDir, "input-video.mp4");
    const framesDir = path.join(tempDir, "frames");

    fs.mkdirSync(framesDir, {
      recursive: true,
    });

    fs.writeFileSync(videoPath, videoBuffer);

    const frameCount = getTargetFrameCount(numericDuration);

    const timestamps = generateTimestamps(
      numericDuration,
      frameCount
    );

    console.log(
      `[Video Frames] Extracting ${timestamps.length} frames from ${numericDuration.toFixed(
        2
      )} second video`
    );

    console.log(
      `[Video Frames] Target timestamps: ${timestamps
        .map((timestamp) => formatTimestamp(timestamp))
        .join(", ")}`
    );

    const frames = [];

    /*
     * Extract frames sequentially.
     *
     * Sequential extraction is intentional here:
     * - avoids spawning too many FFmpeg processes
     * - keeps CPU/RAM usage predictable
     * - works better on the hackathon/development machine
     *
     * Later, this can be moved to a worker queue with controlled
     * concurrency for production.
     */
    for (let i = 0; i < timestamps.length; i += 1) {
      const timestamp = timestamps[i];

      const frameNumber = i + 1;

      const fileName = `frame-${String(frameNumber).padStart(
        3,
        "0"
      )}.jpg`;

      const filePath = path.join(framesDir, fileName);

      console.log(
        `[Video Frames] Extracting frame ${frameNumber}/${timestamps.length} at ${formatTimestamp(
          timestamp
        )}`
      );

      try {
        await extractSingleFrame(
          videoPath,
          filePath,
          timestamp
        );

        /*
         * FFmpeg can technically finish successfully while producing
         * an unexpected/empty output in unusual corrupted-video cases.
         */
        if (!fs.existsSync(filePath)) {
          console.warn(
            `[Video Frames] Frame ${frameNumber} was not created.`
          );

          continue;
        }

        const stats = fs.statSync(filePath);

        if (stats.size === 0) {
          console.warn(
            `[Video Frames] Frame ${frameNumber} is empty.`
          );

          continue;
        }

        frames.push({
          index: frames.length + 1,

          fileName,

          filePath,

          /*
           * Machine-readable timestamp.
           *
           * Example:
           * 4.71
           */
          timestampSeconds: timestamp,

          /*
           * Human-readable timestamp.
           *
           * Example:
           * "00:04.71"
           */
          timestamp: formatTimestamp(timestamp),
        });
      } catch (error) {
        /*
         * One failed frame should not destroy the entire video
         * verification. The remaining frames can still provide
         * useful evidence.
         */
        console.warn(
          `[Video Frames] Failed to extract frame ${frameNumber} at ${formatTimestamp(
            timestamp
          )}: ${error.message}`
        );
      }
    }

    if (frames.length === 0) {
      throw new Error(
        "Unable to extract any usable frames from the video."
      );
    }

    console.log(
      `[Video Frames] Successfully extracted ${frames.length}/${timestamps.length} frames`
    );

    /*
     * IMPORTANT:
     *
     * We return tempDir instead of deleting it here because the
     * verification service still needs to read the frame files.
     *
     * videoVerificationService.js should remove tempDir after
     * analysis finishes, preferably inside finally{}.
     */
    return {
      tempDir,

      videoPath,

      framesDir,

      frames,

      /*
       * Useful metadata for the verification service.
       */
      framesRequested: timestamps.length,

      framesExtracted: frames.length,

      timestamps,
    };
  } catch (error) {
    /*
     * If extraction itself fails, there is no reason to keep the
     * temporary directory.
     */
    removeTempDirectory(tempDir);

    throw error;
  }
};

module.exports = {
  extractVideoFrames,
};