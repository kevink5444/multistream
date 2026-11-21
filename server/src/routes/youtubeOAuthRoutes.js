const express = require("express");

const router = express.Router();

const {
    connectYouTube,
    youtubeCallback,
} = require("../controllers/youtubeOAuthController");

/* =========================================================
   YOUTUBE OAUTH ROUTES
   ========================================================= */

// Memulai proses login Google
router.get("/youtube", connectYouTube);

// Callback setelah login Google
router.get("/youtube/callback", youtubeCallback);

module.exports = router;