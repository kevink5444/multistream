/* =========================================================
   ACTIVITY LOG SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

/* =========================================================
   DATA STORAGE
   ========================================================= */

const dataDirectory = path.join(__dirname, "../data");
const dataPath = path.join(dataDirectory, "activity_logs.json");

/* =========================================================
   INITIALIZE STORAGE
   ========================================================= */

const initializeStorage = () => {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2), "utf8");
  }
};

/* =========================================================
   READ LOGS
   ========================================================= */

const readLogs = () => {
  initializeStorage();

  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[Activity Log] Failed to read logs:", error.message);
    return [];
  }
};

/* =========================================================
   SAVE LOGS
   ========================================================= */

const saveLogs = (logs) => {
  initializeStorage();

  fs.writeFileSync(
    dataPath,
    JSON.stringify(logs, null, 2),
    "utf8"
  );
};

/* =========================================================
   CREATE LOG
   ========================================================= */

const createLog = ({
  type = "info",
  category = "system",
  title,
  description,
  destination = "System",
  metadata = null,
}) => {
  if (!title) {
    throw new Error("Activity log title is required");
  }

  const logs = readLogs();

  const newLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),

    type,
    category,
    title,
    description: description || "",

    destination,

    metadata,

    timestamp: new Date().toISOString(),

    createdAt: new Date().toISOString(),
  };

  logs.unshift(newLog);

  // Maksimum penyimpanan 1000 aktivitas
  const limitedLogs = logs.slice(0, 1000);

  saveLogs(limitedLogs);

  console.log(
    `[Activity Log] ${type.toUpperCase()}: ${title}`
  );

  return newLog;
};

/* =========================================================
   GET ALL LOGS
   ========================================================= */

const getAllLogs = () => {
  return readLogs();
};

/* =========================================================
   GET LOGS BY TYPE
   ========================================================= */

const getLogsByType = (type) => {
  const logs = readLogs();

  return logs.filter((log) => log.type === type);
};

/* =========================================================
   CLEAR LOGS
   ========================================================= */

const clearLogs = () => {
  saveLogs([]);

  return true;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  createLog,
  getAllLogs,
  getLogsByType,
  clearLogs,
};