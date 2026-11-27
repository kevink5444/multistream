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

    const logs = JSON.parse(data);

    return Array.isArray(logs) ? logs : [];
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
  userId = null,

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

  const timestamp = new Date().toISOString();

  const newLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),

    userId: userId ? String(userId) : null,

    type,
    category,

    title,
    description: description || "",

    destination,

    metadata,

    timestamp,
    createdAt: timestamp,
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

const getAllLogs = (user = null) => {
  const logs = readLogs();

  // Admin dapat melihat seluruh aktivitas
  if (user?.role === "admin") {
    return logs;
  }

  // User harus memiliki ID
  const userId = user?.id ?? user?._id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  // User hanya melihat log miliknya
  return logs.filter(
    (log) => String(log.userId) === String(userId)
  );
};

/* =========================================================
   GET LOGS BY TYPE
   ========================================================= */

const getLogsByType = (type, user = null) => {
  const logs = getAllLogs(user);

  return logs.filter(
    (log) => log.type === type
  );
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