const express = require("express");

const router = express.Router();

const youtubeOAuthController = require("../controllers/youtubeOAuthController");
const { requireAuth } = require("../middleware/authMiddleware");

/* =========================================================
   CONNECT YOUTUBE
   GET /api/oauth/youtube
   ========================================================= */

router.get(
    "/youtube",
    requireAuth,
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
    requireAuth,
    youtubeOAuthController.getYouTubeConnectionStatus
);

/* =========================================================
   DISCONNECT YOUTUBE
   DELETE /api/oauth/youtube
   ========================================================= */

router.delete(
    "/youtube",
    requireAuth,
    youtubeOAuthController.disconnectYouTube
);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;