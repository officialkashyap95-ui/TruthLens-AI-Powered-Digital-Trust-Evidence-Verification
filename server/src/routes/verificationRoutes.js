const express = require("express");

const {
  createVerification,
  getVerification,
  getVerificationHistory,
  deleteVerificationHistory,
} = require("../controllers/verificationController");

const upload =
  require("../middleware/uploadMiddleware");

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