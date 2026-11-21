const crypto = require("crypto");

const {
    generateAuthUrl,
    exchangeCode,
    getChannelInfo,
} = require("../services/youtubeOAuthService");

/* =========================================================
   TEMPORARY OAUTH STATE STORAGE
   ========================================================= */

const oauthStates = new Map();

/* =========================================================
   CONNECT YOUTUBE
   GET /api/oauth/youtube
   ========================================================= */

const connectYouTube = (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");

    oauthStates.set(state, {
        createdAt: Date.now(),
    });

    const authUrl = generateAuthUrl(state);

    res.redirect(authUrl);
};

/* =========================================================
   YOUTUBE OAUTH CALLBACK
   GET /api/oauth/youtube/callback
   ========================================================= */

const youtubeCallback = async (req, res) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.status(400).json({
                success: false,
                message: "YouTube authorization was denied.",
                error,
            });
        }

        if (!code || !state) {
            return res.status(400).json({
                success: false,
                message: "Missing OAuth code or state.",
            });
        }

        const savedState = oauthStates.get(state);

        if (!savedState) {
            return res.status(400).json({
                success: false,
                message: "Invalid OAuth state.",
            });
        }

        // State hanya dapat digunakan satu kali
        oauthStates.delete(state);

        // State berlaku maksimal 10 menit
        const stateExpired =
            Date.now() - savedState.createdAt > 10 * 60 * 1000;

        if (stateExpired) {
            return res.status(400).json({
                success: false,
                message: "OAuth session expired. Please try again.",
            });
        }

        // Tukar authorization code dengan token
        const tokens = await exchangeCode(code);

        // Ambil informasi channel YouTube
        const channelInfo = await getChannelInfo(tokens);

        res.json({
            success: true,
            message: "YouTube connected successfully.",
            channel: channelInfo,
        });

    } catch (error) {
        console.error("YouTube OAuth Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to connect YouTube account.",
        });
    }
};

/* =========================================================
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
    connectYouTube,
    youtubeCallback,
};