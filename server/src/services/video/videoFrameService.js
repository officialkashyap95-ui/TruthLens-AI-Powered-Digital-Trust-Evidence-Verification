const fs = require("fs");
const path = require("path");
const os = require("os");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const extractVideoFrames = async (videoBuffer, duration) => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "truthlens-video-")
  );

  const videoPath = path.join(tempDir, "input-video");
  const framesDir = path.join(tempDir, "frames");

  fs.mkdirSync(framesDir);

  fs.writeFileSync(videoPath, videoBuffer);

  // Decide how many frames to analyze.
  let frameCount;

  if (duration <= 15) {
    frameCount = 6;
  } else if (duration <= 60) {
    frameCount = 10;
  } else {
    frameCount = 15;
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        "-vf",
        `fps=${frameCount}/${Math.max(duration, 1)}`,
        "-q:v",
        "2",
      ])
      .output(path.join(framesDir, "frame-%03d.jpg"))
      .on("end", () => {
        try {
          const files = fs
            .readdirSync(framesDir)
            .filter((file) => file.endsWith(".jpg"))
            .sort();

          const frames = files.map((file, index) => ({
            index: index + 1,
            fileName: file,
            filePath: path.join(framesDir, file),
          }));

          resolve({
            tempDir,
            framesDir,
            frames,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      })
      .run();
  });
};

module.exports = {
  extractVideoFrames,
};