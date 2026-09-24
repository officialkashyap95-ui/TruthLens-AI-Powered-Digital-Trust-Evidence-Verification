const fs = require("fs");
const path = require("path");
const os = require("os");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

/* =========================================================
   CONFIGURATION
========================================================= */

const MAX_FRAMES = 15;
const MIN_FRAMES = 6;

const SCENE_THRESHOLD = 0.35;

/*
 * Prevent multiple scene-change timestamps that are
 * extremely close to each other from wasting frame slots.
 */
const SCENE_MIN_GAP = 0.5;

/*
 * If a scene timestamp is very close to an evenly
 * distributed timestamp, consider it the same point.
 */
const TIMESTAMP_MERGE_GAP = 0.15;


/* =========================================================
   FRAME COUNT
========================================================= */

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

  return MAX_FRAMES;
};


/* =========================================================
   TIMESTAMP HELPERS
========================================================= */

const formatTimestamp = (seconds) => {
  const safeSeconds = Math.max(
    Number(seconds) || 0,
    0
  );

  const minutes = Math.floor(
    safeSeconds / 60
  );

  const remainingSeconds =
    safeSeconds - minutes * 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${remainingSeconds
    .toFixed(2)
    .padStart(5, "0")}`;
};


/* =========================================================
   EVENLY DISTRIBUTED TIMESTAMPS
========================================================= */

const generateEvenTimestamps = (
  duration,
  frameCount
) => {
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    frameCount <= 0
  ) {
    return [];
  }

  /*
   * Avoid the exact beginning and end because
   * those frames can sometimes be black/unstable.
   */
  if (frameCount === 1) {
    return [
      Number(
        (duration / 2).toFixed(3)
      ),
    ];
  }

  const timestamps = [];

  for (
    let i = 1;
    i <= frameCount;
    i += 1
  ) {
    const timestamp =
      (duration * i) /
      (frameCount + 1);

    timestamps.push(
      Number(
        timestamp.toFixed(3)
      )
    );
  }

  return timestamps;
};


/* =========================================================
   SCENE DETECTION
========================================================= */

/**
 * Detect scene changes once.
 *
 * IMPORTANT:
 * This function is called only once per video.
 *
 * Scene detection is used for better frame sampling.
 * It is NOT a deepfake detector.
 */
const detectSceneChanges = (
  videoPath,
  duration
) => {
  return new Promise((resolve) => {
    const timestamps = [];

    ffmpeg(videoPath)
      .videoFilters(
        `select='gt(scene,${SCENE_THRESHOLD})',showinfo`
      )
      .outputOptions([
        "-an",
        "-f",
        "null",
      ])
      .output("-")
      .on(
        "stderr",
        (line) => {
          const match =
            line.match(
              /pts_time:([0-9.]+)/
            );

          if (!match) {
            return;
          }

          const timestamp =
            Number(match[1]);

          if (
            !Number.isFinite(timestamp)
          ) {
            return;
          }

          if (
            timestamp <= 0 ||
            timestamp >= duration
          ) {
            return;
          }

          timestamps.push(
            Number(
              timestamp.toFixed(3)
            )
          );
        }
      )
      .on(
        "end",
        () => {
          /*
           * Sort first.
           */
          timestamps.sort(
            (a, b) => a - b
          );

          /*
           * Remove very close scene changes.
           *
           * Example:
           * 2.01
           * 2.08
           * 2.14
           *
           * These should not consume three
           * separate frame slots.
           */
          const filtered = [];

          for (
            const timestamp of timestamps
          ) {
            const previous =
              filtered[
                filtered.length - 1
              ];

            if (
              previous === undefined ||
              timestamp - previous >=
                SCENE_MIN_GAP
            ) {
              filtered.push(
                timestamp
              );
            }
          }

          console.log(
            `[Video Scenes] Detected ${filtered.length} scene-change timestamps`
          );

          resolve(filtered);
        }
      )
      .on(
        "error",
        (error) => {
          /*
           * Scene detection is optional.
           * Never fail the complete video analysis
           * just because scene detection fails.
           */
          console.warn(
            "[Video Scenes] Scene detection failed:",
            error.message
          );

          resolve([]);
        }
      )
      .run();
  });
};


/* =========================================================
   TIMESTAMP UTILITIES
========================================================= */

/**
 * Check whether a timestamp is already represented
 * by another timestamp.
 */
const isTimestampCovered = (
  timestamps,
  timestamp,
  gap = TIMESTAMP_MERGE_GAP
) => {
  return timestamps.some(
    (existing) =>
      Math.abs(
        existing - timestamp
      ) < gap
  );
};


/**
 * Add a timestamp only when it is not already covered.
 */
const addTimestampIfUnique = (
  collection,
  timestamp
) => {
  if (
    !isTimestampCovered(
      collection,
      timestamp
    )
  ) {
    collection.push(timestamp);
    return true;
  }

  return false;
};


/* =========================================================
   TIMESTAMP SELECTION
========================================================= */

/**
 * Select timestamps using:
 *
 * 1. Even timeline coverage
 * 2. Important scene changes
 *
 * The algorithm guarantees that normal timeline
 * coverage is not completely replaced by scene changes.
 */
const selectFrameTimestamps = ({
  duration,
  targetCount,
  sceneChanges,
}) => {
  const evenlyDistributed =
    generateEvenTimestamps(
      duration,
      targetCount
    );

  const selected = [];

  /*
   * -------------------------------------------------------
   * STEP 1
   * Add evenly distributed timestamps first.
   *
   * This guarantees timeline coverage.
   * -------------------------------------------------------
   */

  for (
    const timestamp of
    evenlyDistributed
  ) {
    if (
      selected.length >= targetCount
    ) {
      break;
    }

    addTimestampIfUnique(
      selected,
      timestamp
    );
  }

  /*
   * -------------------------------------------------------
   * STEP 2
   * Add scene changes.
   *
   * Replace the least useful timeline point only
   * when we are already at the frame limit.
   * -------------------------------------------------------
   */

  for (
    const sceneTimestamp of
    sceneChanges
  ) {
    /*
     * If there is already a nearby frame,
     * no need to add another one.
     */
    if (
      isTimestampCovered(
        selected,
        sceneTimestamp
      )
    ) {
      continue;
    }

    /*
     * We still have room.
     */
    if (
      selected.length < targetCount
    ) {
      selected.push(
        sceneTimestamp
      );

      continue;
    }

    /*
     * -----------------------------------------------------
     * We are already at targetCount.
     *
     * Find the timeline frame closest to this scene.
     *
     * If we replace a nearby evenly-distributed frame,
     * we preserve approximately the same timeline coverage
     * while giving preference to the scene change.
     * -----------------------------------------------------
     */

    let closestIndex = -1;
    let closestDistance = Infinity;

    for (
      let i = 0;
      i < selected.length;
      i += 1
    ) {
      const distance =
        Math.abs(
          selected[i] -
            sceneTimestamp
        );

      if (
        distance <
        closestDistance
      ) {
        closestDistance =
          distance;

        closestIndex = i;
      }
    }

    /*
     * Only replace if the existing timestamp
     * is reasonably close to the scene change.
     *
     * Otherwise adding the scene would distort
     * timeline coverage too much.
     */
    if (
      closestIndex !== -1 &&
      closestDistance <= 1.5
    ) {
      selected[
        closestIndex
      ] = sceneTimestamp;
    }
  }

  /*
   * -------------------------------------------------------
   * STEP 3
   * Final cleanup.
   * -------------------------------------------------------
   */

  const finalTimestamps =
    [...new Set(selected)]
      .filter(
        (timestamp) =>
          timestamp > 0 &&
          timestamp < duration
      )
      .sort(
        (a, b) => a - b
      );

  /*
   * -------------------------------------------------------
   * STEP 4
   * Safety fallback.
   *
   * Make sure short videos still have at least
   * MIN_FRAMES where possible.
   * -------------------------------------------------------
   */

  if (
    finalTimestamps.length <
      Math.min(
        MIN_FRAMES,
        targetCount
      )
  ) {
    for (
      const timestamp of
      evenlyDistributed
    ) {
      if (
        finalTimestamps.length >=
        Math.min(
          MIN_FRAMES,
          targetCount
        )
      ) {
        break;
      }

      if (
        !isTimestampCovered(
          finalTimestamps,
          timestamp
        )
      ) {
        finalTimestamps.push(
          timestamp
        );
      }
    }
  }

  return finalTimestamps.sort(
    (a, b) => a - b
  );
};


/* =========================================================
   FRAME EXTRACTION
========================================================= */

const extractSingleFrame = (
  videoPath,
  outputPath,
  timestamp
) => {
  return new Promise(
    (resolve, reject) => {
      ffmpeg(videoPath)
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
        .on(
          "end",
          resolve
        )
        .on(
          "error",
          reject
        )
        .run();
    }
  );
};


/* =========================================================
   CLEANUP
========================================================= */

const removeTempDirectory = (
  tempDir
) => {
  if (!tempDir) {
    return;
  }

  try {
    if (
      fs.existsSync(tempDir)
    ) {
      fs.rmSync(
        tempDir,
        {
          recursive: true,
          force: true,
        }
      );
    }
  } catch (error) {
    console.error(
      "[Video Frames] Failed to remove temporary directory:",
      error.message
    );
  }
};


/* =========================================================
   MAIN EXTRACTION
========================================================= */

const extractVideoFrames = async (
  videoBuffer,
  duration
) => {
  let tempDir = null;

  try {
    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (
      !Buffer.isBuffer(
        videoBuffer
      ) ||
      videoBuffer.length === 0
    ) {
      throw new Error(
        "Invalid or empty video buffer."
      );
    }

    const numericDuration =
      Number(duration);

    if (
      !Number.isFinite(
        numericDuration
      ) ||
      numericDuration <= 0
    ) {
      throw new Error(
        "Invalid video duration."
      );
    }

    /* -----------------------------------------------------
       TEMP DIRECTORY
    ----------------------------------------------------- */

    tempDir =
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          "truthlens-video-"
        )
      );

    const videoPath =
      path.join(
        tempDir,
        "input-video.mp4"
      );

    const framesDir =
      path.join(
        tempDir,
        "frames"
      );

    fs.mkdirSync(
      framesDir,
      {
        recursive: true,
      }
    );

    fs.writeFileSync(
      videoPath,
      videoBuffer
    );

    /* -----------------------------------------------------
       FRAME CONFIGURATION
    ----------------------------------------------------- */

    const targetFrameCount =
      getTargetFrameCount(
        numericDuration
      );

    /*
     * IMPORTANT:
     * Scene detection happens exactly once.
     */
    const sceneChanges =
      await detectSceneChanges(
        videoPath,
        numericDuration
      );

    const timestamps =
      selectFrameTimestamps({
        duration:
          numericDuration,

        targetCount:
          targetFrameCount,

        sceneChanges,
      });

    if (
      !timestamps.length
    ) {
      throw new Error(
        "Unable to determine useful video frame timestamps."
      );
    }

    console.log(
      `[Video Frames] Selected ${timestamps.length} timestamps from ${numericDuration.toFixed(
        2
      )} second video`
    );

    console.log(
      `[Video Frames] Selected timestamps: ${timestamps
        .map(formatTimestamp)
        .join(", ")}`
    );

    /* -----------------------------------------------------
       EXTRACT FRAMES
    ----------------------------------------------------- */

    const frames = [];

    for (
      let i = 0;
      i < timestamps.length;
      i += 1
    ) {
      const timestamp =
        timestamps[i];

      const frameNumber =
        i + 1;

      const fileName =
        `frame-${String(
          frameNumber
        ).padStart(3, "0")}.jpg`;

      const filePath =
        path.join(
          framesDir,
          fileName
        );

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

        if (
          !fs.existsSync(
            filePath
          )
        ) {
          console.warn(
            `[Video Frames] Frame ${frameNumber} was not created.`
          );

          continue;
        }

        const stats =
          fs.statSync(
            filePath
          );

        if (
          stats.size === 0
        ) {
          console.warn(
            `[Video Frames] Frame ${frameNumber} is empty.`
          );

          continue;
        }

        /*
         * Scene flag can be determined immediately
         * because sceneChanges were already calculated.
         */
        const isSceneChange =
          sceneChanges.some(
            (sceneTimestamp) =>
              Math.abs(
                sceneTimestamp -
                  timestamp
              ) <
              TIMESTAMP_MERGE_GAP
          );

        frames.push({
          index:
            frames.length + 1,

          fileName,

          filePath,

          timestampSeconds:
            timestamp,

          timestamp:
            formatTimestamp(
              timestamp
            ),

          isSceneChange,
        });
      } catch (error) {
        console.warn(
          `[Video Frames] Failed to extract frame ${frameNumber} at ${formatTimestamp(
            timestamp
          )}: ${error.message}`
        );
      }
    }

    /* -----------------------------------------------------
       FINAL VALIDATION
    ----------------------------------------------------- */

    if (
      frames.length === 0
    ) {
      throw new Error(
        "Unable to extract any usable frames from the video."
      );
    }

    console.log(
      `[Video Frames] Successfully extracted ${frames.length}/${timestamps.length} frames`
    );

    /* -----------------------------------------------------
       RETURN
    ----------------------------------------------------- */

    return {
      tempDir,

      videoPath,

      framesDir,

      frames,

      framesRequested:
        timestamps.length,

      framesExtracted:
        frames.length,

      timestamps,

      sceneChanges,
    };
  } catch (error) {
    removeTempDirectory(
      tempDir
    );

    throw error;
  }
};


module.exports = {
  extractVideoFrames,
};