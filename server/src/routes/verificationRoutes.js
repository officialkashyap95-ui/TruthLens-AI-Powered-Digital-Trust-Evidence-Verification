const express = require("express");

const {
  createVerification,

  createVideoVerification,

  getVerification,

  getVerificationHistory,

  deleteVerificationHistory,

} = require("../controllers/verificationController");

const upload =
  require("../middleware/uploadMiddleware");
  
const uploadVideo =
  require("../middleware/videoUploadMiddleware");

const router =
  express.Router();

/* =========================================================
   CREATE VERIFICATION
========================================================= */

router.post(
  "/",
  upload.single("file"),
  createVerification
);

/* =========================================================
   CREATE VIDEO VERIFICATION
========================================================= */

router.post(
  "/video",
  uploadVideo.single("file"),
  createVideoVerification
);

/* =========================================================
   GET VERIFICATION HISTORY
========================================================= */

router.get(
  "/history",
  getVerificationHistory
);

/* =========================================================
   DELETE VERIFICATION HISTORY
========================================================= */

router.delete(
  "/history",
  deleteVerificationHistory
);

/* =========================================================
   GET SINGLE VERIFICATION
========================================================= */

router.get(
  "/:verificationId",
  getVerification
);

module.exports =
  router;