const { google } = require("googleapis");

const {
    loadTokens,
    saveTokens,
} = require("./tokenStorageService");

/* =========================================================
   YOUTUBE LIVE API CONFIGURATION
========================================================= */

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
);

/* =========================================================
   TOKEN REFRESH HANDLER
========================================================= */

oauth2Client.on("tokens", (newTokens) => {
    try {
        const existingTokens = loadTokens() || {};

        const updatedTokens = {
            ...existingTokens,
            ...newTokens,
        };

        saveTokens(updatedTokens);

        console.log("[YouTube Live] OAuth tokens updated.");
    } catch (error) {
        console.error(
            "[YouTube Live] Failed to save refreshed tokens:",
            error.message
        );
    }
});

/* =========================================================
   GET AUTHENTICATED YOUTUBE CLIENT
========================================================= */

const getAuthenticatedYouTube = () => {
    const tokens = loadTokens();

    if (!tokens) {
        throw new Error(
            "YouTube account is not connected. Please connect YouTube first."
        );
    }

    oauth2Client.setCredentials(tokens);

    return google.youtube({
        version: "v3",
        auth: oauth2Client,
    });
};

/* =========================================================
   CREATE LIVE BROADCAST
========================================================= */

const createLiveBroadcast = async ({
    title = "MultiStream Live",
    description = "",
    privacyStatus = "unlisted",
} = {}) => {
    const youtube = getAuthenticatedYouTube();

    const response = await youtube.liveBroadcasts.insert({
        part: [
            "snippet",
            "status",
            "contentDetails",
        ],
        requestBody: {
            snippet: {
                title,
                description,
                scheduledStartTime: new Date().toISOString(),
            },
            status: {
                privacyStatus,
                selfDeclaredMadeForKids: false,
            },
            contentDetails: {
                enableAutoStart: false,
                enableAutoStop: false,
                enableDvr: true,
                enableEmbed: true,
                recordFromStart: true,
                monitorStream: {
                    enableMonitorStream: false,
                },
            },
        },
    });

    return response.data;
};

/* =========================================================
   CREATE LIVE STREAM
========================================================= */

const createLiveStream = async ({
    title = "MultiStream Encoder",
    resolution = "1080p",
    frameRate = "60fps",
} = {}) => {
    const youtube = getAuthenticatedYouTube();

    const response = await youtube.liveStreams.insert({
        part: [
            "snippet",
            "cdn",
            "contentDetails",
            "status",
        ],
        requestBody: {
            snippet: {
                title,
            },
            cdn: {
                ingestionType: "rtmp",
                resolution,
                frameRate,
            },
            contentDetails: {
                isReusable: false,
            },
        },
    });

    return response.data;
};

/* =========================================================
   BIND BROADCAST TO LIVE STREAM
========================================================= */

const bindLiveBroadcast = async ({
    broadcastId,
    streamId,
}) => {
    const youtube = getAuthenticatedYouTube();

    const response = await youtube.liveBroadcasts.bind({
        id: broadcastId,
        part: [
            "snippet",
            "contentDetails",
            "status",
        ],
        streamId,
    });

    return response.data;
};

/* =========================================================
   CREATE COMPLETE YOUTUBE LIVE CONFIGURATION
========================================================= */

const createYouTubeLiveConfiguration = async ({
    title = "MultiStream Live",
    description = "",
    privacyStatus = "unlisted",
    resolution = "1080p",
    frameRate = "60fps",
} = {}) => {
    try {
        console.log(
            "[YouTube Live] Creating live broadcast..."
        );

        const broadcast = await createLiveBroadcast({
            title,
            description,
            privacyStatus,
        });

        if (!broadcast.id) {
            throw new Error(
                "YouTube did not return a Broadcast ID."
            );
        }

        console.log(
            "[YouTube Live] Broadcast created:",
            broadcast.id
        );

        console.log(
            "[YouTube Live] Creating live stream..."
        );

        const stream = await createLiveStream({
            title: `${title} - Encoder`,
            resolution,
            frameRate,
        });

        if (!stream.id) {
            throw new Error(
                "YouTube did not return a Stream ID."
            );
        }

        console.log(
            "[YouTube Live] Stream created:",
            stream.id
        );

        console.log(
            "[YouTube Live] Binding broadcast and stream..."
        );

        const boundBroadcast = await bindLiveBroadcast({
            broadcastId: broadcast.id,
            streamId: stream.id,
        });

        const ingestionInfo =
            stream.cdn?.ingestionInfo || {};

        const streamKey =
            ingestionInfo.streamName;

        const ingestionAddress =
            ingestionInfo.ingestionAddress;

        if (!streamKey || !ingestionAddress) {
            throw new Error(
                "YouTube did not return a complete RTMP configuration."
            );
        }

        console.log(
            "[YouTube Live] Configuration created successfully."
        );

        return {
            success: true,

            broadcast: {
                id: broadcast.id,
                title:
                    broadcast.snippet?.title || title,
                status:
                    broadcast.status?.lifeCycleStatus || "created",
            },

            stream: {
                id: stream.id,
                title:
                    stream.snippet?.title ||
                    `${title} - Encoder`,
                status:
                    stream.status?.streamStatus || "created",
            },

            rtmp: {
                serverUrl: ingestionAddress,
                streamKey,
                backupServerUrl:
                    ingestionInfo.backupIngestionAddress ||
                    null,
            },

            watchUrl: broadcast.id
                ? `https://www.youtube.com/watch?v=${broadcast.id}`
                : null,

            boundBroadcastId:
                boundBroadcast.id || broadcast.id,

            boundStreamId:
                stream.id,
        };

    } catch (error) {
        console.error(
            "[YouTube Live] Configuration creation failed:",
            error.message
        );

        throw error;
    }
};

/* =========================================================
   EXPORT SERVICE
========================================================= */

module.exports = {
    getAuthenticatedYouTube,
    createLiveBroadcast,
    createLiveStream,
    bindLiveBroadcast,
    createYouTubeLiveConfiguration,
};