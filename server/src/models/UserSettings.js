const mongoose = require("mongoose");

const userSettingsSchema =
  new mongoose.Schema(
    {
      /* =====================================================
         USER
      ===================================================== */

      userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },


      /* =====================================================
         PRIVACY & DATA
      ===================================================== */

      saveHistory: {
        type: Boolean,
        default: true,
      },


      /* =====================================================
         RESULT DISPLAY
      ===================================================== */

      showConfidence: {
        type: Boolean,
        default: true,
      },

      showEvidence: {
        type: Boolean,
        default: true,
      },


      /* =====================================================
         NOTIFICATIONS
      ===================================================== */

      verificationCompleted: {
        type: Boolean,
        default: true,
      },

      verificationErrors: {
        type: Boolean,
        default: true,
      },


      /* =====================================================
         APPEARANCE
      ===================================================== */

      theme: {
        type: String,

        enum: [
          "light",
          "dark",
        ],

        default: "light",
      },
    },

    {
      timestamps: true,
    }
  );


module.exports =
  mongoose.model(
    "UserSettings",
    userSettingsSchema
  );