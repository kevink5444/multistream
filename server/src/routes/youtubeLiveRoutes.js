const express = require("express");

const router = express.Router();

const youtubeLiveController = require("../controllers/youtubeLiveController");

/* =========================================================
   VERIFY YOUTUBE API CONNECTION
   GET /api/youtube/live/verify
   ========================================================= */

router.get(
    "/verify",
    youtubeLiveController.verifyConnection
);

/* =========================================================
   CREATE YOUTUBE LIVE CONFIGURATION
   POST /api/youtube/live/configuration
   ========================================================= */

router.post(
    "/configuration",
    youtubeLiveController.createLiveConfiguration
);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;