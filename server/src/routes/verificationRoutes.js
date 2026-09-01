const express = require("express");

const {
  createVerification,
  getVerification,
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
   GET VERIFICATION
========================================================= */

router.get(
  "/:verificationId",
  getVerification
);

module.exports = router;