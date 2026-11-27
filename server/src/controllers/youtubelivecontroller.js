/* =========================================================
   YOUTUBE LIVE CONTROLLER
   ========================================================= */

const youtubeLiveService = require("../services/youtubeLiveService");
const destinationService = require("../services/destinationService");

/* =========================================================
   VERIFY YOUTUBE CONNECTION
========================================================= */

const verifyConnection = async (req, res) => {
    try {
        const result =
            await youtubeLiveService.verifyYouTubeConnection();

        res.status(200).json({
            success: true,
            message: "YouTube connection verified successfully.",
            data: result,
        });

    } catch (error) {
        console.error(
            "YouTube Verification Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to verify YouTube connection.",
        });
    }
};

/* =========================================================
   CREATE YOUTUBE LIVE CONFIGURATION
========================================================= */

const createLiveConfiguration = async (req, res) => {
    try {
        const {
            title,
            description,
            privacyStatus,
            resolution,
            fps,
        } = req.body;

        /* VALIDATION */

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Live stream title is required.",
            });
        }

        const allowedPrivacy = [
            "private",
            "unlisted",
            "public",
        ];

        const allowedResolution = [
            "1080p",
            "720p",
            "480p",
            "360p",
        ];

        const allowedFps = [
            "30fps",
            "60fps",
        ];

        const selectedPrivacy =
            privacyStatus || "unlisted";

        const selectedResolution =
            resolution || "1080p";

        const selectedFps =
            fps || "30fps";

        if (!allowedPrivacy.includes(selectedPrivacy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid privacy status.",
            });
        }

        if (!allowedResolution.includes(selectedResolution)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resolution.",
            });
        }

        if (!allowedFps.includes(selectedFps)) {
            return res.status(400).json({
                success: false,
                message: "Invalid FPS configuration.",
            });
        }

        /* CREATE YOUTUBE LIVE */

        const configuration =
            await youtubeLiveService.createYouTubeLiveConfiguration({
                title: title.trim(),
                description: description || "",
                privacyStatus: selectedPrivacy,
                resolution: selectedResolution,
                frameRate: selectedFps,
            });

        /* VALIDATE CONFIGURATION */

        if (
            !configuration ||
            !configuration.success ||
            !configuration.rtmp ||
            !configuration.rtmp.serverUrl ||
            !configuration.rtmp.streamKey ||
            !configuration.broadcast ||
            !configuration.broadcast.id
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "YouTube Live was created, but its configuration is incomplete.",
            });
        }

        /* SAVE DESTINATION AUTOMATICALLY */

       const destination =
    destinationService.createDestination(
        {
            name: title.trim(),
            platform: "youtube",
            status: "pending",
            streamUrl:
                configuration.rtmp.serverUrl,
            streamKey:
                configuration.rtmp.streamKey,
        },
        req.session.user
    );

        /* GENERATE LIVE STUDIO URL */

        const broadcastId =
            configuration.broadcast.id;

        const liveStudioUrl =
            `https://studio.youtube.com/video/${broadcastId}/livestreaming`;

        /* RESPONSE */

        return res.status(201).json({
            success: true,
            message:
                "YouTube Live configuration created and destination saved successfully.",
            data: {
                broadcast:
                    configuration.broadcast,

                stream:
                    configuration.stream,

                rtmp:
                    configuration.rtmp,

                watchUrl:
                    configuration.watchUrl,

                liveStudioUrl,

                destination,
            },
        });

    } catch (error) {
        console.error(
            "Create YouTube Live Configuration Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create YouTube Live configuration.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/* =========================================================
   EXPORT CONTROLLER
========================================================= */

module.exports = {
    verifyConnection,
    createLiveConfiguration,
};