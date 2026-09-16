const express = require("express");
const cors = require("cors");

const verificationRoutes =
  require("./routes/verificationRoutes");

const settingsRoutes =
  require("./routes/settingsRoutes");

const authMiddleware =
  require("./middleware/authMiddleware");

const app =
  express();


/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  process.env.CLIENT_URL ||
    "http://localhost:5173",

  "http://localhost:5173",

  "http://localhost:5174",

  "https://truth-lens-ai-powered-digital-trust.vercel.app",
];


app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {

      /*
       * Allow requests without
       * an Origin header.
       *
       * Useful for curl/Postman/server
       * requests.
       */

      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,
  })
);


/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


/* =========================================================
   ROOT
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "TruthLens API is running",
    });
  }
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,

      service:
        "TruthLens Verification API",

      status:
        "healthy",

      time:
        new Date().toISOString(),
    });
  }
);


/* =========================================================
   DEVELOPMENT AUTHENTICATION
========================================================= */

app.use(
  authMiddleware
);


/* =========================================================
   VERIFICATION ROUTES
========================================================= */

app.use(
  "/api/verifications",
  verificationRoutes
);


/* =========================================================
   SETTINGS ROUTES
========================================================= */

app.use(
  "/api/settings",
  settingsRoutes
);


/* =========================================================
   404 HANDLER
========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,

      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Unhandled server error:"
    );

    console.error(error);

    res.status(
      error.status || 500
    ).json({
      success: false,

      message:
        error.message ||
        "Internal server error.",
    });
  }
);


/* =========================================================
   EXPORT
========================================================= */

module.exports =
  app;