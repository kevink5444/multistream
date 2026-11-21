
const NodeMediaServer = require("node-media-server");

const {
    startForwarder,
    stopForwardersByStream,
} = require("./streamForwarder");

const destinationService = require("./destinationService");

/* =========================================================
   RTMP SERVER CONFIGURATION
========================================================= */

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
    },

    logType: 3,
};

const nms = new NodeMediaServer(config);

/* =========================================================
   SUPPORTED PLATFORMS
========================================================= */

const SUPPORTED_PLATFORMS = [
    "youtube",
    "facebook",
    "instagram",
];

/* =========================================================
   PUBLISHED STREAM TRACKING

   Mencegah postPublish diproses berulang
   untuk session yang sama.
========================================================= */

const processedStreams = new Set();

/* =========================================================
   RTMP CONNECTION
========================================================= */

nms.on("preConnect", () => {
    console.log("[RTMP] Client connecting...");
});

nms.on("postConnect", () => {
    console.log("[RTMP] Client connected.");
});

/* =========================================================
   STREAM START
========================================================= */

nms.on("prePublish", () => {
    console.log("[RTMP] Incoming stream detected.");
});

/* =========================================================
   STREAM PUBLISHED
========================================================= */

nms.on("postPublish", (...args) => {
    const session = args[0];

    if (!session) {
        console.error("[RTMP] Session tidak ditemukan.");
        return;
    }

    const streamPath = session.streamPath;
    const streamId = session.id;

    /* =====================================================
       PREVENT DUPLICATE EVENT
    ===================================================== */

    if (processedStreams.has(streamId)) {
        console.warn(
            `[RTMP] Stream already processed: ${streamId}`
        );

        return;
    }

    processedStreams.add(streamId);

    console.log("------------------------------------");
    console.log("[RTMP] Stream published");
    console.log(`Stream ID: ${streamId}`);
    console.log(`Stream Path: ${streamPath}`);
    console.log("------------------------------------");

    const sourceUrl =
        `rtmp://127.0.0.1:1935${streamPath}`;

    /* =====================================================
       GET DESTINATIONS
    ===================================================== */

    let destinations = [];

    try {
        destinations =
            destinationService.getAllDestinations() || [];
    } catch (error) {
        console.error(
            "[Forwarder] Failed to retrieve destinations:",
            error.message
        );

        processedStreams.delete(streamId);
        return;
    }

    /* =====================================================
       FILTER DESTINATIONS
    ===================================================== */

    const activeDestinations = destinations.filter(
        (destination) => {
            const platform = String(
                destination.platform || ""
            )
                .toLowerCase()
                .trim();

            const isSupported =
                SUPPORTED_PLATFORMS.includes(platform);

            const isEnabled =
                destination.status !== "disabled";

            const hasStreamKey =
                typeof destination.streamKey === "string" &&
                destination.streamKey.trim() !== "";

            const hasStreamUrl =
                typeof destination.streamUrl === "string" &&
                destination.streamUrl.trim() !== "";

            return (
                isSupported &&
                isEnabled &&
                hasStreamKey &&
                hasStreamUrl
            );
        }
    );

    /* =====================================================
       NO DESTINATION
    ===================================================== */

    if (activeDestinations.length === 0) {
        console.log(
            "[Forwarder] No active destination is configured."
        );

        return;
    }

    console.log(
        `[Forwarder] Found ${activeDestinations.length} active destination(s).`
    );

    /* =====================================================
       START FORWARDING
    ===================================================== */

    activeDestinations.forEach(
        (destination, index) => {
            try {
                const platform = String(
                    destination.platform || ""
                )
                    .toLowerCase()
                    .trim();

                const streamUrl = String(
                    destination.streamUrl || ""
                )
                    .trim()
                    .replace(/\/+$/, "");

                const streamKey = String(
                    destination.streamKey || ""
                ).trim();

                const destinationUrl =
                    `${streamUrl}/${streamKey}`;

                /* ---------------------------------------------
                   DESTINATION ID
                --------------------------------------------- */

                const destinationId =
                    destination.id ??
                    `${platform}_${index}`;

                /* ---------------------------------------------
                   FORWARDER ID

                   Satu stream + satu destination
                   memiliki satu forwarder.
                --------------------------------------------- */

                const forwarderId =
                    `${streamId}_destination_${destinationId}`;

                /* ---------------------------------------------
                   DESTINATION METADATA
                --------------------------------------------- */

                const metadata = {
                    streamId,
                    destinationId,
                    platform,
                    destinationName:
                        destination.name || "Unnamed",
                    destinationUrl: streamUrl,
                };

                console.log("------------------------------------");
                console.log("[Forwarder] Destination selected");
                console.log(`Platform: ${platform}`);
                console.log(
                    `Channel: ${destination.name || "Unnamed"}`
                );
                console.log(
                    `Destination ID: ${destinationId}`
                );
                console.log("------------------------------------");

                /* ---------------------------------------------
                   START RELAY
                --------------------------------------------- */

                const started = startForwarder(
                    forwarderId,
                    sourceUrl,
                    destinationUrl,
                    metadata
                );

                if (!started) {
                    console.warn(
                        `[Forwarder] Could not start destination: ${destinationId}`
                    );
                }
            } catch (error) {
                /* ---------------------------------------------
                   ERROR IN ONE DESTINATION

                   Tidak menghentikan destination lainnya.
                --------------------------------------------- */

                console.error(
                    `[Forwarder] Failed to process destination ${index}:`,
                    error.message
                );
            }
        }
    );
});

/* =========================================================
   STREAM STOP
========================================================= */

nms.on("donePublish", (...args) => {
    const session = args[0];

    if (!session) {
        console.log("[RTMP] Stream stopped.");
        return;
    }

    const streamId = session.id;

    console.log("------------------------------------");
    console.log("[RTMP] Stream unpublished");
    console.log(`Stream ID: ${streamId}`);
    console.log("------------------------------------");

    /* =====================================================
       STOP ALL FORWARDERS FOR THIS STREAM
    ===================================================== */

    const stoppedCount =
        stopForwardersByStream(streamId);

    console.log(
        `[Forwarder] Stop requested for ${stoppedCount} destination(s).`
    );

    /* =====================================================
       CLEANUP
    ===================================================== */

    processedStreams.delete(streamId);
});

/* =========================================================
   CLIENT DISCONNECTED
========================================================= */

nms.on("doneConnect", () => {
    console.log("[RTMP] Client disconnected.");
});

/* =========================================================
   START RTMP SERVER
========================================================= */

function startRTMPServer() {
    nms.run();

    console.log("------------------------------------");
    console.log("MultiStream RTMP Server Started");
    console.log("RTMP Ingest: rtmp://localhost:1935/live");
    console.log("Supported Destinations:");
    console.log("- YouTube Live");
    console.log("- Facebook Live");
    console.log("- Instagram Live");
    console.log("------------------------------------");
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    startRTMPServer,
};
