/* =========================================================
   MULTISTREAM EXPRESS APPLICATION
   ========================================================= */

const express = require("express");
const cors = require("cors");
const session = require("express-session");

const settingsRoutes = require("./routes/settingsRoutes");
const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const youtubeOAuthRoutes = require("./routes/youtubeOAuthRoutes");
const youtubeLiveRoutes = require("./routes/youtubeLiveRoutes");
const forwarderRoutes = require("./routes/forwarderRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const systemRoutes = require("./routes/systemRoutes");

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
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* =========================================================
   SESSION CONFIGURATION
   ========================================================= */

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "multistream-session-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

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
    startedAt: global.multistreamServerStartedAt,
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   AUTH ROUTES
   ========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   DESTINATION ROUTES
   ========================================================= */

app.use("/api/destinations", destinationRoutes);

/* =========================================================
   SETTINGS ROUTES
   ========================================================= */

app.use("/api/settings", settingsRoutes);

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
   ACTIVITY LOG ROUTES
   ========================================================= */

app.use("/api/activity-logs", activityLogRoutes);

/* =========================================================
   NOTIFICATION ROUTES
   ========================================================= */

app.use("/api/notifications", notificationRoutes);

/* =========================================================
   SYSTEM ROUTES
   ========================================================= */

app.use("/api/system", systemRoutes);

/* =========================================================
   EXPORT APPLICATION
   ========================================================= */

module.exports = app;