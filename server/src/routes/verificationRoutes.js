const express = require("express");

const {
  createVerification,
} = require("../controllers/verificationController");

const router = express.Router();

router.post("/", createVerification);

module.exports = router;