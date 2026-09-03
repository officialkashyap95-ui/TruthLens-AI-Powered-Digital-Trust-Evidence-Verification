const express = require("express");

const {
  createVerification,
  getVerification,
  getVerificationHistory,
} = require("../controllers/verificationController");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

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
   IMPORTANT:
   This MUST come before /:verificationId
========================================================= */

router.get(
  "/history",
  getVerificationHistory
);

/* =========================================================
   GET SINGLE VERIFICATION
========================================================= */

router.get(
  "/:verificationId",
  getVerification
);

module.exports = router;