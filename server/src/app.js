/* =========================================================
   MULTISTREAM EXPRESS APPLICATION
   ========================================================= */

const express = require("express");
const cors = require("cors");

const destinationRoutes = require("./routes/destinationRoutes");
const youtubeOAuthRoutes = require("./routes/youtubeOAuthRoutes");
const youtubeLiveRoutes = require("./routes/youtubeLiveRoutes");
const forwarderRoutes = require("./routes/forwarderRoutes");

/* =========================================================
   INITIALIZE EXPRESS
   ========================================================= */

const app = express();

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* =========================================================
   ROOT ROUTE
   GET /
   ========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MultiStream Backend API is running",
    version: "1.0.0",
  });
});

/* =========================================================
   SYSTEM STATUS
   GET /api/status
   ========================================================= */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    application: "MultiStream",
    status: "online",
    backend: "Node.js + Express",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   DESTINATION ROUTES
   ========================================================= */

app.use("/api/destinations", destinationRoutes);

/* =========================================================
   YOUTUBE OAUTH ROUTES
   ========================================================= */

app.use("/api/oauth", youtubeOAuthRoutes);

/* =========================================================
   YOUTUBE LIVE ROUTES
   ========================================================= */

app.use("/api/youtube/live", youtubeLiveRoutes);

/* =========================================================
   FORWARDER ROUTES
   ========================================================= */

app.use("/api/forwarders", forwarderRoutes);

/* =========================================================
   EXPORT APPLICATION
   ========================================================= */

module.exports = app;