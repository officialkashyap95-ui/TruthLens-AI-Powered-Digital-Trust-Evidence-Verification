const express = require("express");

const {
  createVerification,
  getVerification,
} = require("../controllers/verificationController");

const router = express.Router();

/*
 * Create a new verification.
 *
 * POST:
 * /api/verifications
 */
router.post(
  "/",
  createVerification
);

/*
 * Get an existing verification.
 *
 * GET:
 * /api/verifications/:verificationId
 */
router.get(
  "/:verificationId",
  getVerification
);

module.exports = router;