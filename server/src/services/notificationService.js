/* =========================================================
   MULTISTREAM NOTIFICATION SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(__dirname, "../data");
const dataPath = path.join(dataDirectory, "notifications.json");

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
   READ NOTIFICATIONS
   ========================================================= */

const readNotifications = () => {
  initializeStorage();

  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
  } catch (error) {
    console.error("[Notification] Failed to read:", error.message);
    return [];
  }
};

/* =========================================================
   SAVE NOTIFICATIONS
   ========================================================= */

const saveNotifications = (notifications) => {
  initializeStorage();

  fs.writeFileSync(
    dataPath,
    JSON.stringify(notifications.slice(0, 500), null, 2),
    "utf8"
  );
};

/* =========================================================
   CREATE NOTIFICATION
   ========================================================= */

const createNotification = ({
  type = "info",
  category = "system",
  title,
  description = "",
  metadata = {},
}) => {
  if (!title) {
    throw new Error("Notification title is required");
  }

  const notifications = readNotifications();

  const notification = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type,
    category,
    title,
    description,
    metadata,
    read: false,
    timestamp: new Date().toISOString(),
  };

  notifications.unshift(notification);

  saveNotifications(notifications);

  console.log(`[Notification] ${title}`);

  return notification;
};

/* =========================================================
   GET ALL
   ========================================================= */

const getAllNotifications = () => {
  return readNotifications();
};

/* =========================================================
   MARK AS READ
   ========================================================= */

const markAsRead = (id) => {
  const notifications = readNotifications();

  const updated = notifications.map((notification) =>
    String(notification.id) === String(id)
      ? { ...notification, read: true }
      : notification
  );

  saveNotifications(updated);

  return updated.find(
    (notification) => String(notification.id) === String(id)
  );
};

/* =========================================================
   MARK ALL AS READ
   ========================================================= */

const markAllAsRead = () => {
  const notifications = readNotifications().map((notification) => ({
    ...notification,
    read: true,
  }));

  saveNotifications(notifications);

  return notifications;
};

/* =========================================================
   CLEAR NOTIFICATIONS
   ========================================================= */

const clearNotifications = () => {
  saveNotifications([]);
  return true;
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  createNotification,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
};