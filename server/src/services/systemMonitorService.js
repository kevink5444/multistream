/* =========================================================
   MULTISTREAM SYSTEM MONITOR
   ========================================================= */

const fs = require("fs");
const path = require("path");
const os = require("os");

const systemEventService = require("./systemEventService");

const dataDirectory = path.join(__dirname, "../data");

const statePath = path.join(
  dataDirectory,
  "system_state.json"
);

/* =========================================================
   SERVER START TIME
   ========================================================= */

const serverStartedAt = new Date().toISOString();

global.multistreamServerStartedAt = serverStartedAt;

/* =========================================================
   INITIALIZE STORAGE
   ========================================================= */

const initializeStorage = () => {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(statePath)) {
    fs.writeFileSync(
      statePath,
      JSON.stringify({}, null, 2),
      "utf8"
    );
  }
};

/* =========================================================
   READ STATE
   ========================================================= */

const readState = () => {
  initializeStorage();

  try {
    return JSON.parse(
      fs.readFileSync(statePath, "utf8")
    );
  } catch (error) {
    console.error("[System Monitor] State read error:", error.message);
    return {};
  }
};

/* =========================================================
   SAVE STATE
   ========================================================= */

const saveState = (state) => {
  initializeStorage();

  fs.writeFileSync(
    statePath,
    JSON.stringify(state, null, 2),
    "utf8"
  );
};

/* =========================================================
   SERVER SIGNATURE
   ========================================================= */

const getServerSignature = () => {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    operatingSystem: os.type(),
    architecture: os.arch(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
  };
};

/* =========================================================
   INITIALIZE MONITOR
   ========================================================= */

const initializeSystemMonitor = () => {
  const previousState = readState();

  const currentSignature = getServerSignature();

  /* =======================================================
     RESTART DETECTION
     ======================================================= */

  const previousStart = previousState.lastStartedAt;

  if (previousStart) {
    systemEventService.emitSystemEvent({
      type: "warning",
      category: "system",
      title: "Backend restarted",
      description:
        "MultiStream backend has restarted.",
      metadata: {
        previousStartedAt: previousStart,
        currentStartedAt: serverStartedAt,
      },
    });
  } else {
    systemEventService.emitSystemEvent({
      type: "success",
      category: "system",
      title: "Backend initialized",
      description:
        "MultiStream backend server started successfully.",
      metadata: {
        startedAt: serverStartedAt,
      },
    });
  }

  /* =======================================================
     SERVER CHANGE DETECTION
     ======================================================= */

  if (previousState.serverSignature) {
    const previousSignature =
      previousState.serverSignature;

    const changedFields = [];

    Object.keys(currentSignature).forEach((key) => {
      if (
        previousSignature[key] !== currentSignature[key]
      ) {
        changedFields.push({
          field: key,
          previous: previousSignature[key],
          current: currentSignature[key],
        });
      }
    });

    if (changedFields.length > 0) {
      systemEventService.emitSystemEvent({
        type: "warning",
        category: "system",
        title: "Server environment changed",
        description:
          "MultiStream detected a change in the server environment.",
        metadata: {
          changes: changedFields,
        },
      });
    }
  }

  /* =======================================================
     SAVE CURRENT STATE
     ======================================================= */

  saveState({
    lastStartedAt: serverStartedAt,
    serverSignature: currentSignature,
  });
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  initializeSystemMonitor,
  getServerSignature,
};