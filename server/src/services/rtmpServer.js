const NodeMediaServer = require("node-media-server");

const {
    startForwarder,
    stopForwarder,
} = require("./streamForwarder");

const destinationService = require("./destinationService");

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

// ========================================
// RTMP CONNECTION
// ========================================

nms.on("preConnect", (...args) => {
    console.log("[RTMP] Client connecting");
});

nms.on("postConnect", (...args) => {
    console.log("[RTMP] Client connected");
});

// ========================================
// STREAM START
// ========================================

nms.on("prePublish", (...args) => {
    console.log("[RTMP] Incoming stream");
});

// ========================================
// STREAM PUBLISHED
// ========================================

nms.on("postPublish", (...args) => {
    const session = args[0];

    if (!session) {
        console.error("[RTMP] Session tidak ditemukan.");
        return;
    }

    const streamPath = session.streamPath;
    const streamId = session.id;

    console.log("------------------------------------");
    console.log("[RTMP] Stream started");
    console.log(`Stream ID: ${streamId}`);
    console.log(`Stream Path: ${streamPath}`);
    console.log("------------------------------------");

    const sourceUrl = `rtmp://127.0.0.1:1935${streamPath}`;

    // Ambil destination yang sudah tersimpan
    const destinations = destinationService.getAllDestinations();

    // Cari destination YouTube yang memiliki stream key
    const youtubeDestinations = destinations.filter((destination) => {
        return (
            destination.platform === "youtube" &&
            destination.streamKey &&
            destination.streamUrl
        );
    });

    if (youtubeDestinations.length === 0) {
        console.log("[Forwarder] YouTube destination belum dikonfigurasi.");
        return;
    }

    // Mulai forwarding ke setiap destination
    youtubeDestinations.forEach((destination) => {
        const destinationUrl =
            `${destination.streamUrl}/${destination.streamKey}`;

        const forwarderId = `${streamId}_${destination.platform}`;

        startForwarder(
            forwarderId,
            sourceUrl,
            destinationUrl
        );
    });
});

// ========================================
// STREAM STOP
// ========================================

nms.on("donePublish", (...args) => {
    const session = args[0];

    if (!session) {
        console.log("[RTMP] Stream stopped");
        return;
    }

    const streamId = session.id;

    console.log("------------------------------------");
    console.log("[RTMP] Stream stopped");
    console.log(`Stream ID: ${streamId}`);
    console.log("------------------------------------");

    // Stop forwarding untuk stream ini
    stopForwarder(`${streamId}_youtube`);
});

// ========================================
// CLIENT DISCONNECTED
// ========================================

nms.on("doneConnect", (...args) => {
    console.log("[RTMP] Client disconnected");
});

// ========================================
// START RTMP SERVER
// ========================================

function startRTMPServer() {
    nms.run();

    console.log("------------------------------------");
    console.log("MultiStream RTMP Server Started");
    console.log("RTMP Server: rtmp://localhost:1935");
    console.log("------------------------------------");
}

module.exports = {
    startRTMPServer,
};