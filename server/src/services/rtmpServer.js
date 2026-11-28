/* =========================================================
   MULTISTREAM RTMP SERVER
   ========================================================= */

const NodeMediaServer = require("node-media-server");

const {
  startForwarder,
  stopForwardersByStream,
} = require("./streamForwarder");

const destinationService = require("./destinationService");
const sourceService = require("./sourceService");

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
   STREAM TRACKING
   ========================================================= */

// Prevent the same publisher session from being processed twice.
const processedStreams = new Set();

// Only sessions validated in prePublish may continue to postPublish.
// Map: sessionId -> authenticated Source object
const authorizedStreams = new Map();

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Extract the incoming key from an RTMP stream path.
 *
 * Expected path:
 * /live/ms_live_<random-key>
 */
const extractStreamKey = (streamPath) => {
  if (typeof streamPath !== "string") {
    return null;
  }

  const parts = streamPath.split("/").filter(Boolean);

  // Require the configured RTMP application and one stream name.
  if (parts.length !== 2 || parts[0] !== "live") {
    return null;
  }

  return parts[1] || null;
};

/**
 * Reject an RTMP publishing session safely.
 */
const rejectSession = (sessionId, reason) => {
  const session = nms.getSession(sessionId);

  console.warn(`[RTMP] Publish rejected: ${reason}`);

  if (session && typeof session.reject === "function") {
    session.reject();
  }
};

/**
 * Get only destinations owned by the Source owner.
 *
 * destinationService ownership filtering is reused here.
 */
const getOwnerDestinations = (source) => {
  if (!source || !source.userId) {
    return [];
  }

  return destinationService.getAllDestinations({
    id: source.userId,
  });
};

/* =========================================================
   RTMP CONNECTION
   ========================================================= */

nms.on("preConnect", (id) => {
  console.log(`[RTMP] Client connecting. Session: ${id}`);
});

nms.on("postConnect", (id) => {
  console.log(`[RTMP] Client connected. Session: ${id}`);
});

/* =========================================================
   STREAM AUTHENTICATION
   ========================================================= */

nms.on("prePublish", (id, streamPath, args) => {
  console.log(`[RTMP] Publish attempt. Session: ${id}`);
  console.log(`[RTMP] Stream path: ${streamPath}`);

  const streamKey = extractStreamKey(streamPath);

  /* ---------------------------------------------------------
     VALIDATE RTMP PATH
  --------------------------------------------------------- */

  if (!streamKey) {
    rejectSession(
      id,
      "Invalid RTMP application or stream path."
    );

    return;
  }

  /* ---------------------------------------------------------
     LOOKUP SOURCE BY STREAM KEY
  --------------------------------------------------------- */

  let source;

  try {
    source = sourceService.getSourceByStreamKey(streamKey);
  } catch (error) {
    console.error(
      "[RTMP] Source lookup failed:",
      error.message
    );

    rejectSession(id, "Source validation failed.");

    return;
  }

  /* ---------------------------------------------------------
     INVALID STREAM KEY
  --------------------------------------------------------- */

  if (!source) {
    rejectSession(id, "Invalid Input Stream Key.");

    return;
  }

  /* ---------------------------------------------------------
     VALIDATE SOURCE OWNER
  --------------------------------------------------------- */

  if (!source.userId) {
    rejectSession(id, "Source has no owner.");

    return;
  }

  /* ---------------------------------------------------------
     AUTHORIZE SESSION
  --------------------------------------------------------- */

  authorizedStreams.set(String(id), source);

  console.log("------------------------------------");
  console.log("[RTMP] Stream Key authenticated");
  console.log(`Session ID: ${id}`);
  console.log(`Source ID: ${source.id}`);
  console.log(
    `Source Name: ${source.name || "Unnamed Source"}`
  );
  console.log(`Owner ID: ${source.userId}`);
  console.log("------------------------------------");
});

/* =========================================================
   STREAM PUBLISHED
   ========================================================= */

nms.on("postPublish", (id, streamPath, args) => {
  const streamId = String(id);

  /* ---------------------------------------------------------
     GET AUTHENTICATED SOURCE
  --------------------------------------------------------- */

  const source = authorizedStreams.get(streamId);

  // Defensive check:
  // Only an authenticated session may be relayed.
  if (!source) {
    rejectSession(id, "Session was not authenticated.");

    return;
  }

  /* ---------------------------------------------------------
     PREVENT DUPLICATE PROCESSING
  --------------------------------------------------------- */

  if (processedStreams.has(streamId)) {
    console.warn(
      `[RTMP] Stream already processed: ${streamId}`
    );

    return;
  }

  processedStreams.add(streamId);

  /* ---------------------------------------------------------
     STREAM INFORMATION
  --------------------------------------------------------- */

  console.log("------------------------------------");
  console.log("[RTMP] Stream published");
  console.log(`Session ID: ${streamId}`);
  console.log(`Stream Path: ${streamPath}`);
  console.log(`Source ID: ${source.id}`);
  console.log(`Owner ID: ${source.userId}`);
  console.log("------------------------------------");

  /* ---------------------------------------------------------
     SOURCE URL
  --------------------------------------------------------- */

  const sourceUrl =
    `rtmp://127.0.0.1:1935${streamPath}`;

  /* =========================================================
     GET OWNER DESTINATIONS
  ========================================================= */

  let destinations = [];

  try {
    destinations = getOwnerDestinations(source) || [];
  } catch (error) {
    console.error(
      "[Forwarder] Failed to retrieve owner's destinations:",
      error.message
    );

    processedStreams.delete(streamId);

    return;
  }

  /* =========================================================
     FILTER ACTIVE DESTINATIONS
  ========================================================= */

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

  /* =========================================================
     NO ACTIVE DESTINATION
  ========================================================= */

  if (activeDestinations.length === 0) {
    console.log(
      `[Forwarder] No active destination for owner ${source.userId}.`
    );

    return;
  }

  /* =========================================================
     DESTINATION INFORMATION
  ========================================================= */

  console.log(
    `[Forwarder] Found ${activeDestinations.length} active destination(s) for owner ${source.userId}.`
  );

  /* =========================================================
     START FORWARDING
  ========================================================= */

  activeDestinations.forEach(
    (destination, index) => {
      try {
        /* -----------------------------------------------------
           PLATFORM
        ----------------------------------------------------- */

        const platform = String(
          destination.platform || ""
        )
          .toLowerCase()
          .trim();

        /* -----------------------------------------------------
           STREAM URL
        ----------------------------------------------------- */

        const streamUrl = String(
          destination.streamUrl || ""
        )
          .trim()
          .replace(/\/+$/, "");

        /* -----------------------------------------------------
           STREAM KEY
        ----------------------------------------------------- */

        const streamKey = String(
          destination.streamKey || ""
        ).trim();

        /* -----------------------------------------------------
           DESTINATION URL
        ----------------------------------------------------- */

        const destinationUrl =
          `${streamUrl}/${streamKey}`;

        /* -----------------------------------------------------
           DESTINATION ID
        ----------------------------------------------------- */

        const destinationId =
          destination.id ?? `${platform}_${index}`;

        /* -----------------------------------------------------
           FORWARDER ID
        ----------------------------------------------------- */

        const forwarderId =
          `${streamId}_destination_${destinationId}`;

        /* -----------------------------------------------------
           DESTINATION METADATA
        ----------------------------------------------------- */

        const metadata = {
          streamId,
          sourceId: source.id,
          sourceName: source.name || "Unnamed Source",
          userId: source.userId,

          destinationId,
          platform,

          destinationName:
            destination.name || "Unnamed",

          destinationUrl: streamUrl,
        };

        /* -----------------------------------------------------
           LOG DESTINATION
        ----------------------------------------------------- */

        console.log("------------------------------------");
        console.log("[Forwarder] Destination selected");
        console.log(`Platform: ${platform}`);
        console.log(
          `Channel: ${destination.name || "Unnamed"}`
        );
        console.log(`Destination ID: ${destinationId}`);
        console.log(`Owner ID: ${source.userId}`);
        console.log("------------------------------------");

        /* -----------------------------------------------------
           START RELAY
        ----------------------------------------------------- */

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
        /* -----------------------------------------------------
           ERROR IN ONE DESTINATION

           A failure on one destination must not block
           the other destinations.
        ----------------------------------------------------- */

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

nms.on("donePublish", (id, streamPath, args) => {
  const streamId = String(id);

  const source = authorizedStreams.get(streamId);

  /* ---------------------------------------------------------
     STREAM INFORMATION
  --------------------------------------------------------- */

  console.log("------------------------------------");
  console.log("[RTMP] Stream unpublished");
  console.log(`Session ID: ${streamId}`);
  console.log(`Stream Path: ${streamPath || "Unknown"}`);

  if (source) {
    console.log(`Source ID: ${source.id}`);
    console.log(`Owner ID: ${source.userId}`);
  }

  console.log("------------------------------------");

  /* =========================================================
     STOP ALL FORWARDERS FOR THIS SESSION
  ========================================================= */

  const stoppedCount =
    stopForwardersByStream(streamId);

  console.log(
    `[Forwarder] Stop requested for ${stoppedCount} destination(s).`
  );

  /* =========================================================
     CLEANUP
  ========================================================= */

  processedStreams.delete(streamId);

  authorizedStreams.delete(streamId);
});

/* =========================================================
   CLIENT DISCONNECTED
   ========================================================= */

nms.on("doneConnect", (id) => {
  console.log(
    `[RTMP] Client disconnected. Session: ${id}`
  );

  /*
   * Clean up authorization in case the client disconnected
   * without completing a publish session.
   */

  authorizedStreams.delete(String(id));
});

/* =========================================================
   START RTMP SERVER
   ========================================================= */

function startRTMPServer() {
  nms.run();

  console.log("------------------------------------");
  console.log("MultiStream RTMP Server Started");
  console.log("RTMP Ingest: rtmp://localhost:1935/live");
  console.log("Input Stream Key: required and validated");
  console.log("Destination Routing: owner-isolated");
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