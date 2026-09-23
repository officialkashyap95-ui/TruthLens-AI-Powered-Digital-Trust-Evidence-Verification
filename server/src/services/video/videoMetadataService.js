const fs = require("fs");
const path = require("path");
const os = require("os");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const getVideoMetadata = async (videoBuffer) => {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "truthlens-metadata-")
  );

  const videoPath = path.join(tempDir, "input-video");

  fs.writeFileSync(videoPath, videoBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (error, metadata) => {
      // Remove temporary video
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error("Temporary file cleanup failed:", cleanupError);
      }

      if (error) {
        return reject(error);
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );

      if (!videoStream) {
        return reject(new Error("No video stream found."));
      }

      resolve({
        duration: Number(metadata.format.duration || 0),
        size: Number(metadata.format.size || 0),
        format: metadata.format.format_name || null,
        codec: videoStream.codec_name || null,
        width: videoStream.width || null,
        height: videoStream.height || null,
        fps: getFrameRate(videoStream.r_frame_rate),
      });
    });
  });
};

const getFrameRate = (frameRate) => {
  if (!frameRate || !frameRate.includes("/")) {
    return null;
  }

  const [numerator, denominator] = frameRate.split("/").map(Number);

  if (!denominator) {
    return null;
  }

  return Number((numerator / denominator).toFixed(2));
};

module.exports = {
  getVideoMetadata,
};