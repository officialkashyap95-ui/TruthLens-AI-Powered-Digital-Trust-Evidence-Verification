const multer = require("multer");

const storage = multer.memoryStorage();

const allowedTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.has(file.mimetype)) {
    return cb(
      new Error(
        "Invalid video format. Only MP4, MOV, and WEBM videos are supported."
      ),
      false
    );
  }

  cb(null, true);
};

const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = uploadVideo;