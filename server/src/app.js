const express = require("express");
const cors = require("cors");

const verificationRoutes = require("./routes/verificationRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TruthLens API is running",
  });
});

app.use("/api/verifications", verificationRoutes);

module.exports = app;