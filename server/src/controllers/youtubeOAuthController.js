const crypto = require("crypto");

const {
    generateAuthUrl,
    exchangeCode,
    getChannelInfo,
} = require("../services/youtubeOAuthService");

const {
    saveTokens,
    loadTokens,
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
        const {
            code,
            state,
            error,
        } = req.query;

        /* Authorization denied */

        if (error) {
            return res.status(400).json({
                success: false,
                message: "YouTube authorization was denied.",
                error,
            });
        }

        /* Validate OAuth parameters */

        if (!code || !state) {
            return res.status(400).json({
                success: false,
                message: "Missing OAuth code or state.",
            });
        }

        /* Validate OAuth state */

        const savedState = oauthStates.get(state);

        if (!savedState) {
            return res.status(400).json({
                success: false,
                message: "Invalid OAuth state.",
            });
        }

        oauthStates.delete(state);

        /* Check OAuth session expiration */

        const stateExpired =
            Date.now() - savedState.createdAt >
            10 * 60 * 1000;

        if (stateExpired) {
            return res.status(400).json({
                success: false,
                message: "OAuth session expired. Please try again.",
            });
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

        /* Save tokens securely */

        saveTokens(tokens);

        /* OAuth success response */

        res.json({
            success: true,
            message: "YouTube connected successfully.",
            channel: channelInfo,
        });

    } catch (error) {
        console.error(
            "YouTube OAuth Error:",
            error.message
        );

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