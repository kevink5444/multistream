const express = require("express");

const router = express.Router();

const youtubeOAuthController = require("../controllers/youtubeOAuthController");

/* =========================================================
   CONNECT YOUTUBE
   GET /api/oauth/youtube
   ========================================================= */

router.get(
    "/youtube",
    youtubeOAuthController.connectYouTube
);

/* =========================================================
   OAUTH CALLBACK
   GET /api/oauth/youtube/callback
   ========================================================= */

router.get(
    "/youtube/callback",
    youtubeOAuthController.youtubeCallback
);

/* =========================================================
   CONNECTION STATUS
   GET /api/oauth/status
   ========================================================= */

router.get(
    "/status",
    youtubeOAuthController.getYouTubeConnectionStatus
);

/* =========================================================
   DISCONNECT YOUTUBE
   DELETE /api/oauth/youtube
   ========================================================= */

router.delete(
    "/youtube",
    youtubeOAuthController.disconnectYouTube
);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;