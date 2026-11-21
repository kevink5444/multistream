const { google } = require("googleapis");

/* =========================================================
   YOUTUBE OAUTH CONFIGURATION
   ========================================================= */

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
);

/* =========================================================
   GENERATE AUTHORIZATION URL
   ========================================================= */

const generateAuthUrl = (state) => {
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/youtube",
        ],
        state,
    });
};

/* =========================================================
   EXCHANGE AUTHORIZATION CODE
   ========================================================= */

const exchangeCode = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);

    return tokens;
};

/* =========================================================
   GET AUTHENTICATED YOUTUBE CHANNEL
   ========================================================= */

const getChannelInfo = async (tokens) => {
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
        version: "v3",
        auth: oauth2Client,
    });

    const response = await youtube.channels.list({
        part: ["snippet", "id"],
        mine: true,
    });

    return response.data;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
    generateAuthUrl,
    exchangeCode,
    getChannelInfo,
};