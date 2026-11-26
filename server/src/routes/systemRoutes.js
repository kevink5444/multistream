/* =========================================================
   SYSTEM ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

const os = require("os");

const { requireAuth } = require("../middleware/authMiddleware");

/* =========================================================
   AUTHENTICATION
   ========================================================= */

router.use(requireAuth);

/* =========================================================
   SYSTEM INFORMATION
   GET /api/system/info
   ========================================================= */

router.get("/info", (req, res) => {
  try {
    res.status(200).json({
      success: true,

      data: {
        application: "MultiStream",

        backend: "Node.js + Express",

        hostname: os.hostname(),

        platform: os.platform(),

        operatingSystem: os.type(),

        architecture: os.arch(),

        nodeVersion: process.version,

        environment: process.env.NODE_ENV || "development",

        processId: process.pid,

        serverStartedAt: global.multistreamServerStartedAt,

        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[System Info]", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve system information",
    });
  }
});

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = router;