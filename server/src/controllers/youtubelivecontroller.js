const liveService = require("../services/youtubeLiveService");

const createYouTubeLiveConfiguration =
    liveService.createYouTubeLiveConfiguration;

/* =========================================================
   CREATE YOUTUBE LIVE CONFIGURATION
   POST /api/youtube/live/configuration
========================================================= */

const createLiveConfiguration = async (req, res) => {
    try {
        const {
            title,
            description,
            privacyStatus,
            resolution,
            frameRate,
        } = req.body || {};

        /* ================================================
           VALIDATE TITLE
        ================================================ */

        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                title.trim().length === 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Live stream title must be a valid string.",
            });
        }

        /* ================================================
           VALIDATE PRIVACY STATUS
        ================================================ */

        const allowedPrivacyStatuses = [
            "private",
            "unlisted",
            "public",
        ];

        if (
            privacyStatus !== undefined &&
            !allowedPrivacyStatuses.includes(privacyStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid privacy status.",
                allowedValues: allowedPrivacyStatuses,
            });
        }

        /* ================================================
           VALIDATE RESOLUTION
        ================================================ */

        const allowedResolutions = [
            "1080p",
            "720p",
            "480p",
            "360p",
        ];

        if (
            resolution !== undefined &&
            !allowedResolutions.includes(resolution)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid stream resolution.",
                allowedValues: allowedResolutions,
            });
        }

        /* ================================================
           VALIDATE FRAME RATE
        ================================================ */

        const allowedFrameRates = [
            "30fps",
            "60fps",
        ];

        if (
            frameRate !== undefined &&
            !allowedFrameRates.includes(frameRate)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid stream frame rate.",
                allowedValues: allowedFrameRates,
            });
        }

        /* ================================================
           CREATE CONFIGURATION
        ================================================ */

        console.log(
            "[YouTube Live Controller] Creating configuration..."
        );

        const configuration =
            await createYouTubeLiveConfiguration({
                title: title?.trim() || "MultiStream Live",

                description:
                    typeof description === "string"
                        ? description
                        : "",

                privacyStatus:
                    privacyStatus || "unlisted",

                resolution:
                    resolution || "1080p",

                frameRate:
                    frameRate || "60fps",
            });

        /* ================================================
           SUCCESS RESPONSE
        ================================================ */

        return res.status(201).json({
            success: true,
            message:
                "YouTube live configuration created successfully.",
            data: configuration,
        });

    } catch (error) {
        console.error(
            "[YouTube Live Controller] Error:",
            error.message
        );

        /* ================================================
           HANDLE AUTHENTICATION ERRORS
        ================================================ */

        if (
            error.message.includes("not connected") ||
            error.message.includes("OAuth")
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "YouTube account is not connected or authorization has expired.",
            });
        }

        /* ================================================
           HANDLE YOUTUBE API ERRORS
        ================================================ */

        return res.status(500).json({
            success: false,
            message:
                "Failed to create YouTube live configuration.",
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
    createLiveConfiguration,
};