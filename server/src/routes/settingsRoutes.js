const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const router =
  express.Router();

/* =========================================================
   GET SETTINGS
========================================================= */

router.get(
  "/",
  getSettings
);

/* =========================================================
   UPDATE SETTINGS
========================================================= */

router.patch(
  "/",
  updateSettings
);

module.exports =
  router;