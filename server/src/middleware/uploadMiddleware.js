const multer = require("multer");

// Keep uploaded files in memory.
// We will analyze the image and do not need to save it permanently yet.
const storage = multer.memoryStorage();

// Only allow image files for the image verification endpoint.
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid image format. Only JPG, PNG, and WEBP images are supported."
      ),
      false
    );
  }
};

// Maximum image size: 10 MB.
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;