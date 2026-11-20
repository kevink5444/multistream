/* =========================================================
   MULTISTREAM EXPRESS APPLICATION
   ========================================================= */

const express = require("express");
const cors = require("cors");

const destinationRoutes = require("./routes/destinationRoutes");

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
   EXPORT APPLICATION
   ========================================================= */

module.exports = app;