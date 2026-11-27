const crypto = require("crypto");

const {
    generateAuthUrl,
    exchangeCode,
    getChannelInfo,
} = require("../services/youtubeOAuthService");

const {
    saveTokens,
    loadTokens,
    deleteTokens,
} = require("../services/tokenStorageService");

/* =========================================================
   TEMPORARY OAUTH STATE STORAGE
   ========================================================= */

const oauthStates = new Map();

/* =========================================================
   CONNECT YOUTUBE
   GET /api/oauth/youtube
   ========================================================= */

const connectYouTube = (req, res) => {
    try {
        const state = crypto.randomBytes(32).toString("hex");

        oauthStates.set(state, {
        createdAt: Date.now(),
        sessionID: req.sessionID,
        });

        const authUrl = generateAuthUrl(state);

        res.redirect(authUrl);

    } catch (error) {
        console.error("YouTube Connect Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to initiate YouTube connection.",
        });
    }
};

/* =========================================================
   YOUTUBE OAUTH CALLBACK
   GET /api/oauth/youtube/callback
   ========================================================= */

/* =========================================================
   YOUTUBE OAUTH CALLBACK
   GET /api/oauth/youtube/callback
   ========================================================= */

const youtubeCallback = async (req, res) => {
    const FRONTEND_URL = "http://localhost:5173";

    try {
        const {
            code,
            state,
            error,
        } = req.query;

        /* Authorization denied */

        if (error) {
            return res.redirect(
                `${FRONTEND_URL}/oauth/youtube/callback?status=error&message=${encodeURIComponent(
                    "YouTube authorization was denied."
                )}`
            );
        }

        /* Validate OAuth parameters */

        if (!code || !state) {
            return res.redirect(
                `${FRONTEND_URL}/oauth/youtube/callback?status=error&message=${encodeURIComponent(
                    "Missing OAuth code or state."
                )}`
            );
        }

        /* Validate OAuth state */

        const savedState = oauthStates.get(state);

        if (!savedState) {
            return res.redirect(
                `${FRONTEND_URL}/oauth/youtube/callback?status=error&message=${encodeURIComponent(
                    "Invalid OAuth state."
                )}`
            );
        }

        oauthStates.delete(state);

        /* Check OAuth session expiration */

        const stateExpired =
            Date.now() - savedState.createdAt >
            10 * 60 * 1000;

        if (stateExpired) {
            return res.redirect(
                `${FRONTEND_URL}/oauth/youtube/callback?status=error&message=${encodeURIComponent(
                    "OAuth session expired. Please try again."
                )}`
            );
        }

        /* Check session */

        if (savedState.sessionID !== req.sessionID) {
            return res.redirect(
                `${FRONTEND_URL}/oauth/youtube/callback?status=error&message=${encodeURIComponent(
                    "OAuth session mismatch. Please try again."
                )}`
            );
        }

        /* Exchange authorization code */

        const tokens = await exchangeCode(code);

        /* Preserve existing refresh token */

        const existingTokens = loadTokens();

        if (
            !tokens.refresh_token &&
            existingTokens?.refresh_token
        ) {
            tokens.refresh_token =
                existingTokens.refresh_token;
        }

        /* Get authenticated YouTube channel */

        const channelInfo = await getChannelInfo(tokens);

        /* Save tokens */

        saveTokens(tokens);

        /* Redirect to frontend success page */

        return res.redirect(
            `${FRONTEND_URL}/oauth/youtube/callback?status=success`
        );

    } catch (error) {
        console.error(
            "YouTube OAuth Error:",
            error.message
        );

        return res.redirect(
            `${FRONTEND_URL}/oauth/youtube/callback?status=error&message=${encodeURIComponent(
                "Failed to connect YouTube account."
            )}`
        );
    }
};

/* =========================================================
   CHECK YOUTUBE CONNECTION STATUS
   GET /api/oauth/status
   ========================================================= */

const getYouTubeConnectionStatus = (req, res) => {
    try {
        const tokens = loadTokens();

        if (!tokens) {
            return res.json({
                success: true,
                connected: false,
                message: "YouTube is not connected.",
            });
        }

        res.json({
            success: true,
            connected: true,
            message: "YouTube is connected.",
            tokenInfo: {
                hasAccessToken: Boolean(
                    tokens.access_token
                ),
                hasRefreshToken: Boolean(
                    tokens.refresh_token
                ),
                expiryDate:
                    tokens.expiry_date || null,
            },
        });

    } catch (error) {
        console.error(
            "YouTube Status Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            connected: false,
            message: "Failed to check YouTube connection.",
        });
    }
};

/* =========================================================
   DISCONNECT YOUTUBE
   DELETE /api/oauth/youtube
   ========================================================= */

const disconnectYouTube = (req, res) => {
    try {
        deleteTokens();

        res.json({
            success: true,
            connected: false,
            message: "YouTube disconnected successfully.",
        });

    } catch (error) {
        console.error(
            "YouTube Disconnect Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to disconnect YouTube.",
        });
    }
};

/* =========================================================
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
    connectYouTube,
    youtubeCallback,
    getYouTubeConnectionStatus,
    disconnectYouTube,
};