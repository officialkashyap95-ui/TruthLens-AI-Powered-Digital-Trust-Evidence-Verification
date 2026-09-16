const UserSettings = require("../models/UserSettings");


/* =========================================================
   GET SETTINGS
========================================================= */

const getSettings = async (
  req,
  res
) => {
  try {
    const userId =
      req.userId ||
      "development-user";


    let settings =
      await UserSettings.findOne({
        userId,
      }).lean();


    /* =====================================================
       CREATE DEFAULT SETTINGS
    ===================================================== */

    if (!settings) {
      settings =
        await UserSettings.create({
          userId,
        });

      settings =
        settings.toObject();
    }


    return res.status(200).json({
      success: true,

      message:
        "Settings retrieved successfully.",

      settings,
    });

  } catch (error) {
    console.error(
      "Get settings error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to retrieve settings.",
    });
  }
};


/* =========================================================
   UPDATE SETTINGS
========================================================= */

const updateSettings = async (
  req,
  res
) => {
  try {
    const userId =
      req.userId ||
      "development-user";


    const {
      saveHistory,
      showConfidence,
      showEvidence,
      verificationCompleted,
      verificationErrors,
      theme,
    } = req.body;


    /* =====================================================
       VALIDATE BOOLEAN VALUES
    ===================================================== */

    const booleanFields = [
      "saveHistory",
      "showConfidence",
      "showEvidence",
      "verificationCompleted",
      "verificationErrors",
    ];


    for (const field of booleanFields) {
      if (
        req.body[field] !== undefined &&
        typeof req.body[field] !== "boolean"
      ) {
        return res.status(400).json({
          success: false,

          message:
            `${field} must be a boolean.`,
        });
      }
    }


    /* =====================================================
       VALIDATE THEME
    ===================================================== */

    if (
      theme !== undefined &&
      !["light", "dark"].includes(theme)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Theme must be either light or dark.",
      });
    }


    /* =====================================================
       BUILD UPDATE
    ===================================================== */

    const update = {};


    if (
      saveHistory !== undefined
    ) {
      update.saveHistory =
        saveHistory;
    }


    if (
      showConfidence !== undefined
    ) {
      update.showConfidence =
        showConfidence;
    }


    if (
      showEvidence !== undefined
    ) {
      update.showEvidence =
        showEvidence;
    }


    if (
      verificationCompleted !== undefined
    ) {
      update.verificationCompleted =
        verificationCompleted;
    }


    if (
      verificationErrors !== undefined
    ) {
      update.verificationErrors =
        verificationErrors;
    }


    if (
      theme !== undefined
    ) {
      update.theme =
        theme;
    }


    /* =====================================================
       UPDATE / CREATE
    ===================================================== */

    const settings =
      await UserSettings.findOneAndUpdate(
        {
          userId,
        },

        {
          $set: update,

          $setOnInsert: {
            userId,
          },
        },

        {
          new: true,

          upsert: true,

          setDefaultsOnInsert: true,
        }
      ).lean();


    return res.status(200).json({
      success: true,

      message:
        "Settings updated successfully.",

      settings,
    });

  } catch (error) {
    console.error(
      "Update settings error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to update settings.",
    });
  }
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  getSettings,
  updateSettings,
};