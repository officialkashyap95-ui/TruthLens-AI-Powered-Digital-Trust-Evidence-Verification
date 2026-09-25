const multer = require("multer");

const storage =
  multer.memoryStorage();

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const fileFilter = (
  req,
  file,
  cb
) => {

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Supported formats are JPG, PNG, WEBP, and PDF."
      ),
      false
    );
  }
};

const upload = multer({
  storage,

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = upload;