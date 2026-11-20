const { spawn } = require("child_process");

const FFMPEG_PATH = "C:\\ffmpeg\\bin\\ffmpeg.exe";

const activeForwarders = new Map();

/**
 * Memulai forwarding stream dari RTMP server
 * menuju destination.
 */
function startForwarder(streamId, sourceUrl, destinationUrl) {
    if (activeForwarders.has(streamId)) {
        console.log(`[Forwarder] Stream ${streamId} sudah berjalan.`);
        return;
    }

    console.log("------------------------------------");
    console.log("[Forwarder] Starting stream relay");
    console.log(`[Forwarder] Stream ID: ${streamId}`);
    console.log("------------------------------------");

    const args = [
        "-hide_banner",
        "-loglevel", "info",

        // Input stream
        "-i", sourceUrl,

        // Tidak melakukan encoding ulang
        "-c:v", "copy",
        "-c:a", "copy",

        // Format output RTMP
        "-f", "flv",

        // Destination
        destinationUrl,
    ];

    const ffmpeg = spawn(FFMPEG_PATH, args, {
        windowsHide: true,
    });

    activeForwarders.set(streamId, ffmpeg);

   ffmpeg.stderr.on("data", (data) => {
    let message = data.toString().trim();

    if (message) {
        // Menyamarkan path RTMP yang berpotensi berisi stream key
        message = message.replace(
            /(rtmps?:\/\/[^/\s]+\/)[^\s]+/gi,
            "$1[REDACTED]"
        );

        console.log(`[FFmpeg] ${message}`);
    }
});
    ffmpeg.on("spawn", () => {
        console.log(`[Forwarder] FFmpeg started: ${streamId}`);
    });

    ffmpeg.on("error", (error) => {
        console.error(`[Forwarder] FFmpeg error: ${error.message}`);

        activeForwarders.delete(streamId);
    });

    ffmpeg.on("close", (code) => {
        console.log(
            `[Forwarder] FFmpeg stopped. Stream: ${streamId}, Exit code: ${code}`
        );

        activeForwarders.delete(streamId);
    });
}

/**
 * Menghentikan forwarding stream.
 */
function stopForwarder(streamId) {
    const ffmpeg = activeForwarders.get(streamId);

    if (!ffmpeg) {
        console.log(`[Forwarder] Stream ${streamId} tidak ditemukan.`);
        return;
    }

    console.log(`[Forwarder] Stopping stream: ${streamId}`);

    ffmpeg.kill("SIGTERM");

    activeForwarders.delete(streamId);
}

/**
 * Mendapatkan daftar forwarder aktif.
 */
function getActiveForwarders() {
    return Array.from(activeForwarders.keys());
}

module.exports = {
    startForwarder,
    stopForwarder,
    getActiveForwarders,
};