const express = require("express");
const cors = require("cors");

const verificationRoutes =
  require("./routes/verificationRoutes");

const app = express();

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

app.get("/", (req, res) => {
  res.json({
    success: true,

    message:
      "TruthLens API is running",
  });
});

app.get(
  "/api/health",
  (req, res) => {
    res.json({
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

app.use(
  "/api/verifications",
  verificationRoutes
);

module.exports = app;