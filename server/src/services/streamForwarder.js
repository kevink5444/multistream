const { spawn } = require("child_process");

/* =========================================================
   FFMPEG CONFIGURATION
========================================================= */

const FFMPEG_PATH = "C:\\ffmpeg\\bin\\ffmpeg.exe";

/* =========================================================
   FORWARDER STORAGE
========================================================= */

// Menyimpan proses FFmpeg aktif
const activeForwarders = new Map();

// Menyimpan status seluruh forwarder
const forwarderStatuses = new Map();

// Menyimpan konfigurasi relay untuk retry
const forwarderConfigs = new Map();

// Menyimpan timer retry
const retryTimers = new Map();

// Menyimpan jumlah retry
const retryAttempts = new Map();

// Maksimal retry otomatis
const MAX_RETRIES = 3;

// Interval retry: 2 detik, 5 detik, 10 detik
const RETRY_DELAYS = [2000, 5000, 10000];

/* =========================================================
   LOG URL SANITIZER

   Melindungi stream key agar tidak tampil di terminal.
========================================================= */

function sanitizeLog(message) {
    return String(message).replace(
        /(?:rtmp|rtmps|srt|https?):\/\/[^\s"'<>]+/gi,
        "[STREAM_URL_REDACTED]"
    );
}

/* =========================================================
   UPDATE FORWARDER STATUS
========================================================= */

function updateStatus(streamId, status, details = {}) {
    const previous = forwarderStatuses.get(streamId) || {};

    const updated = {
        ...previous,
        streamId,
        status,
        updatedAt: new Date().toISOString(),
        ...details,
    };

    forwarderStatuses.set(streamId, updated);

    console.log(
        `[Forwarder] Status ${streamId}: ${status.toUpperCase()}`
    );

    return updated;
}

/* =========================================================
   CLEAR RETRY TIMER
========================================================= */

function clearRetryTimer(streamId) {
    const timer = retryTimers.get(streamId);

    if (timer) {
        clearTimeout(timer);
        retryTimers.delete(streamId);
    }
}

/* =========================================================
   SCHEDULE RETRY

   Retry:
   1. 2 detik
   2. 5 detik
   3. 10 detik

   Jika seluruh retry gagal:
   Status menjadi FAILED.
========================================================= */

function scheduleRetry(streamId) {
    // Hindari timer retry ganda
    if (retryTimers.has(streamId)) {
        return;
    }

    const attempts = retryAttempts.get(streamId) || 0;

    // Maksimal retry tercapai
    if (attempts >= MAX_RETRIES) {
        updateStatus(streamId, "failed", {
            retryAttempt: attempts,
            maxRetries: MAX_RETRIES,
            lastError: "Maximum retry attempts reached",
        });

        console.log(
            `[Forwarder] Retry limit reached: ${streamId}`
        );

        return;
    }

    const nextAttempt = attempts + 1;
    const delay = RETRY_DELAYS[attempts];

    retryAttempts.set(streamId, nextAttempt);

    updateStatus(streamId, "reconnecting", {
        retryAttempt: nextAttempt,
        maxRetries: MAX_RETRIES,
    });

    console.log(
        `[Forwarder] Retry ${nextAttempt}/${MAX_RETRIES} for ${streamId} in ${delay / 1000}s`
    );

    const timer = setTimeout(() => {
        retryTimers.delete(streamId);

        const config = forwarderConfigs.get(streamId);

        if (!config) {
            console.log(
                `[Forwarder] Retry cancelled: config not found for ${streamId}`
            );

            return;
        }

        const currentStatus =
            forwarderStatuses.get(streamId)?.status;

        // Relay dihentikan secara manual
        if (
            currentStatus === "stopping" ||
            currentStatus === "stopped"
        ) {
            console.log(
                `[Forwarder] Retry cancelled: ${streamId} has been stopped`
            );

            return;
        }

        // Pastikan tidak ada proses FFmpeg lain
        if (activeForwarders.has(streamId)) {
            console.log(
                `[Forwarder] Retry skipped: process already active for ${streamId}`
            );

            return;
        }

        console.log(
            `[Forwarder] Retrying relay: ${streamId}`
        );

        startForwarder(
            streamId,
            config.sourceUrl,
            config.destinationUrl,
            config.metadata
        );
    }, delay);

    retryTimers.set(streamId, timer);
}

/* =========================================================
   START FORWARDER
========================================================= */

function startForwarder(
    streamId,
    sourceUrl,
    destinationUrl,
    metadata = {}
) {
    // Hindari menjalankan proses FFmpeg ganda
    if (activeForwarders.has(streamId)) {
        console.log(
            `[Forwarder] Forwarder already exists: ${streamId}`
        );

        return false;
    }

    // Bersihkan timer retry yang mungkin masih ada
    clearRetryTimer(streamId);

    // Simpan konfigurasi untuk retry
    forwarderConfigs.set(streamId, {
        sourceUrl,
        destinationUrl,
        metadata,
    });

    console.log("------------------------------------");
    console.log("[Forwarder] Starting relay");
    console.log(`Forwarder ID: ${streamId}`);
    console.log("------------------------------------");

    updateStatus(streamId, "connecting", {
        ...metadata,
        startedAt: new Date().toISOString(),
        connectedAt: null,
        stoppedAt: null,
        lastError: null,
        exitCode: null,
        signal: null,
    });

    /* =====================================================
       FFMPEG ARGUMENTS
    ===================================================== */

    const args = [
        "-hide_banner",

        "-loglevel",
        "info",

        // Input stream
        "-i",
        sourceUrl,

        // Copy video tanpa re-encoding
        "-c:v",
        "copy",

        // Copy audio tanpa re-encoding
        "-c:a",
        "copy",

        // Maximum muxing queue
        "-max_muxing_queue_size",
        "1024",

        // Output format
        "-f",
        "flv",

        // Destination
        destinationUrl,
    ];

    /* =====================================================
       SPAWN FFMPEG
    ===================================================== */

    let ffmpeg;

    try {
        ffmpeg = spawn(FFMPEG_PATH, args, {
            windowsHide: true,
            stdio: ["ignore", "ignore", "pipe"],
        });
    } catch (error) {
        console.error(
            `[Forwarder] Failed to spawn FFmpeg: ${error.message}`
        );

        updateStatus(streamId, "failed", {
            lastError: error.message,
            stoppedAt: new Date().toISOString(),
        });

        scheduleRetry(streamId);

        return false;
    }

    activeForwarders.set(streamId, ffmpeg);

    /* =====================================================
       FFMPEG STDERR

       CONNECTED:
       Ketika FFmpeg berhasil membuka output.

       Output #0 menandakan output muxer berhasil dibuka.
    ===================================================== */

    let stderrBuffer = "";

    ffmpeg.stderr.on("data", (data) => {
        stderrBuffer += data.toString();

        const lines = stderrBuffer.split(/\r?\n/);

        stderrBuffer = lines.pop() || "";

        for (const rawLine of lines) {
            const line = rawLine.trim();

            if (!line) {
                continue;
            }

            const message = sanitizeLog(line);

            console.log(
                `[FFmpeg][${streamId}] ${message}`
            );

            /* ---------------------------------------------
               CONNECTION SUCCESS DETECTION
            --------------------------------------------- */

            if (
                line.includes("Output #0") &&
                forwarderStatuses.get(streamId)?.status === "connecting"
            ) {
                // Koneksi berhasil, reset retry
                retryAttempts.delete(streamId);

                clearRetryTimer(streamId);

                updateStatus(streamId, "connected", {
                    connectedAt: new Date().toISOString(),
                    lastError: null,
                    retryAttempt: 0,
                    maxRetries: MAX_RETRIES,
                });
            }

            /* ---------------------------------------------
               ERROR DETECTION
            --------------------------------------------- */

            if (
                /error|failed|failure|refused|timed out|i\/o error/i.test(line)
            ) {
                const currentStatus =
                    forwarderStatuses.get(streamId)?.status;

                if (
                    currentStatus === "connecting" ||
                    currentStatus === "connected"
                ) {
                    updateStatus(streamId, currentStatus, {
                        lastError: message,
                    });
                }
            }
        }
    });

    /* =====================================================
       FFMPEG SPAWN EVENT
    ===================================================== */

    ffmpeg.on("spawn", () => {
        console.log(
            `[Forwarder] FFmpeg process started: ${streamId}`
        );
    });

    /* =====================================================
       FFMPEG ERROR EVENT
    ===================================================== */

    ffmpeg.on("error", (error) => {
        console.error(
            `[Forwarder] Process error (${streamId}): ${error.message}`
        );

        if (activeForwarders.get(streamId) === ffmpeg) {
            activeForwarders.delete(streamId);
        }

        const currentStatus =
            forwarderStatuses.get(streamId)?.status;

        // Jangan retry jika sedang dihentikan
        if (
            currentStatus === "stopping" ||
            currentStatus === "stopped"
        ) {
            return;
        }

        updateStatus(streamId, "failed", {
            lastError: error.message,
            stoppedAt: new Date().toISOString(),
        });

        scheduleRetry(streamId);
    });

    /* =====================================================
       FFMPEG CLOSE EVENT
    ===================================================== */

    ffmpeg.on("close", (code, signal) => {
        console.log(
            `[Forwarder] Process closed: ${streamId}`
        );

        console.log(
            `[Forwarder] Exit code: ${code ?? "unknown"}`
        );

        if (signal) {
            console.log(
                `[Forwarder] Signal: ${signal}`
            );
        }

        if (activeForwarders.get(streamId) === ffmpeg) {
            activeForwarders.delete(streamId);
        }

        const currentStatus =
            forwarderStatuses.get(streamId)?.status;

        /* ---------------------------------------------
           INTENTIONALLY STOPPED
        --------------------------------------------- */

        if (currentStatus === "stopping") {
            clearRetryTimer(streamId);

            retryAttempts.delete(streamId);

            updateStatus(streamId, "stopped", {
                stoppedAt: new Date().toISOString(),
                exitCode: code,
                signal: signal || null,
                lastError: null,
            });

            return;
        }

        /* ---------------------------------------------
           NORMAL TERMINATION
        --------------------------------------------- */

        if (code === 0) {
            clearRetryTimer(streamId);

            retryAttempts.delete(streamId);

            updateStatus(streamId, "stopped", {
                stoppedAt: new Date().toISOString(),
                exitCode: code,
                signal: signal || null,
            });

            return;
        }

        /* ---------------------------------------------
           UNEXPECTED TERMINATION
        --------------------------------------------- */

        updateStatus(streamId, "failed", {
            stoppedAt: new Date().toISOString(),
            exitCode: code,
            signal: signal || null,
            lastError:
                code !== null
                    ? `FFmpeg exited with code ${code}`
                    : "FFmpeg terminated unexpectedly",
        });

        console.warn(
            `[Forwarder] Relay ended unexpectedly: ${streamId}`
        );

        // Retry otomatis
        scheduleRetry(streamId);
    });

    return true;
}

/* =========================================================
   STOP FORWARDER
========================================================= */

function stopForwarder(streamId) {
    // Batalkan retry timer
    clearRetryTimer(streamId);

    // Reset retry counter
    retryAttempts.delete(streamId);

    const ffmpeg = activeForwarders.get(streamId);

    // Jika proses FFmpeg tidak aktif
    if (!ffmpeg) {
        const currentStatus =
            forwarderStatuses.get(streamId)?.status;

        // Relay sedang reconnect atau menunggu retry
        if (
            currentStatus === "reconnecting" ||
            currentStatus === "connecting" ||
            currentStatus === "failed"
        ) {
            updateStatus(streamId, "stopped", {
                stoppedAt: new Date().toISOString(),
                lastError: null,
            });

            console.log(
                `[Forwarder] Retry cancelled and stopped: ${streamId}`
            );

            return true;
        }

        console.log(
            `[Forwarder] Forwarder not found: ${streamId}`
        );

        return false;
    }

    console.log(
        `[Forwarder] Stopping: ${streamId}`
    );

    updateStatus(streamId, "stopping");

    try {
        ffmpeg.kill("SIGTERM");

        return true;
    } catch (error) {
        console.error(
            `[Forwarder] Failed to stop ${streamId}: ${error.message}`
        );

        updateStatus(streamId, "failed", {
            lastError: error.message,
        });

        return false;
    }
}

/* =========================================================
   STOP ALL FORWARDERS FOR STREAM

   Menghentikan semua destination milik satu stream.
========================================================= */

function stopForwardersByStream(streamId) {
    const prefix = `${streamId}_destination_`;

    // Forwarder yang sedang aktif
    const activeIds = Array.from(
        activeForwarders.keys()
    ).filter((id) => id.startsWith(prefix));

    // Forwarder yang sedang menunggu retry
    const retryIds = Array.from(
        retryTimers.keys()
    ).filter((id) => id.startsWith(prefix));

    // Forwarder yang statusnya masih berjalan
    const statusIds = Array.from(
        forwarderStatuses.keys()
    ).filter((id) => {
        if (!id.startsWith(prefix)) {
            return false;
        }

        const status =
            forwarderStatuses.get(id)?.status;

        return [
            "connecting",
            "connected",
            "reconnecting",
            "stopping",
        ].includes(status);
    });

    // Gabungkan semua ID tanpa duplikasi
    const forwarderIds = [
        ...new Set([
            ...activeIds,
            ...retryIds,
            ...statusIds,
        ]),
    ];

    forwarderIds.forEach((forwarderId) => {
        stopForwarder(forwarderId);
    });

    console.log(
        `[Forwarder] Stopped ${forwarderIds.length} forwarder(s) for stream ${streamId}`
    );

    return forwarderIds.length;
}

/* =========================================================
   GET ACTIVE FORWARDERS
========================================================= */

function getActiveForwarders() {
    return Array.from(activeForwarders.keys());
}

/* =========================================================
   GET SINGLE FORWARDER STATUS
========================================================= */

function getForwarderStatus(streamId) {
    return forwarderStatuses.get(streamId) || null;
}

/* =========================================================
   GET ALL FORWARDER STATUSES
========================================================= */

function getForwarderStatuses() {
    return Array.from(forwarderStatuses.values());
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    startForwarder,
    stopForwarder,
    stopForwardersByStream,
    getActiveForwarders,
    getForwarderStatus,
    getForwarderStatuses,
};