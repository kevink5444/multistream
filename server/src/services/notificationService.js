
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
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    return Array.isArray(data) ? data : [];
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
   USER HELPERS
   ========================================================= */

const getUserId = (user) => {
  if (!user) return null;

  if (typeof user === "string" || typeof user === "number") {
    return String(user);
  }

  return user.id ? String(user.id) : null;
};

const getUserRole = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  return user.role || null;
};

/* =========================================================
   NOTIFICATION VISIBILITY
   ========================================================= */

const isNotificationVisibleToUser = (notification, user) => {
  const userId = getUserId(user);
  const userRole = getUserRole(user);

  const notificationUserId = notification.userId
    ? String(notification.userId)
    : null;

  const targetRole = notification.targetRole || null;

  // Notification yang sudah di-dismiss oleh user
  const dismissedBy = Array.isArray(notification.dismissedBy)
    ? notification.dismissedBy
    : [];

  if (userId && dismissedBy.includes(userId)) {
    return false;
  }

  // Notification khusus user
  if (notificationUserId) {
    return notificationUserId === userId;
  }

  // Notification khusus role
  if (targetRole) {
    return targetRole === userRole;
  }

  // Notification global / legacy
  return true;
};

/* =========================================================
   USER-SPECIFIC READ STATUS
   ========================================================= */

const getNotificationForUser = (notification, user) => {
  const userId = getUserId(user);

  const readBy = Array.isArray(notification.readBy)
    ? notification.readBy
    : [];

  let isRead = Boolean(notification.read);

  // Untuk notification global, read status bersifat per user
  if (!notification.userId && !notification.targetRole) {
    if (userId && readBy.includes(userId)) {
      isRead = true;
    } else if (userId && !readBy.includes(userId)) {
      isRead = false;
    }
  }

  return {
    ...notification,
    read: isRead,
  };
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
  userId = null,
  targetRole = null,
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

    userId: userId ? String(userId) : null,
    targetRole: targetRole || null,

    read: false,
    readBy: [],
    dismissedBy: [],

    timestamp: new Date().toISOString(),
  };

  notifications.unshift(notification);

  saveNotifications(notifications);

  console.log(
    `[Notification] ${title} ${
      userId
        ? `(User: ${userId})`
        : targetRole
          ? `(Role: ${targetRole})`
          : "(Global)"
    }`
  );

  return notification;
};

/* =========================================================
   GET NOTIFICATIONS
   ========================================================= */

const getAllNotifications = (user) => {
  return readNotifications()
    .filter((notification) =>
      isNotificationVisibleToUser(notification, user)
    )
    .map((notification) =>
      getNotificationForUser(notification, user)
    );
};

/* =========================================================
   MARK ONE AS READ
   ========================================================= */

const markAsRead = (id, user) => {
  const notifications = readNotifications();
  const userId = getUserId(user);

  if (!userId) {
    return null;
  }

  let updatedNotification = null;

  const updated = notifications.map((notification) => {
    if (String(notification.id) !== String(id)) {
      return notification;
    }

    if (!isNotificationVisibleToUser(notification, user)) {
      return notification;
    }

    // Notification global: readBy per user
    if (!notification.userId && !notification.targetRole) {
      const readBy = Array.isArray(notification.readBy)
        ? [...notification.readBy]
        : [];

      if (!readBy.includes(userId)) {
        readBy.push(userId);
      }

      const updatedItem = {
        ...notification,
        readBy,
      };

      updatedNotification = getNotificationForUser(
        updatedItem,
        user
      );

      return updatedItem;
    }

    // Notification khusus user/role
    const updatedItem = {
      ...notification,
      read: true,
    };

    updatedNotification = getNotificationForUser(
      updatedItem,
      user
    );

    return updatedItem;
  });

  if (updatedNotification) {
    saveNotifications(updated);
  }

  return updatedNotification;
};

/* =========================================================
   MARK ALL AS READ
   ========================================================= */

const markAllAsRead = (user) => {
  const notifications = readNotifications();
  const userId = getUserId(user);

  if (!userId) {
    return [];
  }

  const updated = notifications.map((notification) => {
    if (!isNotificationVisibleToUser(notification, user)) {
      return notification;
    }

    // Notification global: read status per user
    if (!notification.userId && !notification.targetRole) {
      const readBy = Array.isArray(notification.readBy)
        ? [...notification.readBy]
        : [];

      if (!readBy.includes(userId)) {
        readBy.push(userId);
      }

      return {
        ...notification,
        readBy,
      };
    }

    // Notification khusus user/role
    return {
      ...notification,
      read: true,
    };
  });

  saveNotifications(updated);

  return updated
    .filter((notification) =>
      isNotificationVisibleToUser(notification, user)
    )
    .map((notification) =>
      getNotificationForUser(notification, user)
    );
};

/* =========================================================
   CLEAR NOTIFICATIONS
   ========================================================= */

const clearNotifications = (user) => {
  const userId = getUserId(user);
  const userRole = getUserRole(user);

  if (!userId) {
    return false;
  }

  const notifications = readNotifications();

  const updated = notifications
    .map((notification) => {
      // Global notification: dismiss untuk user ini saja
      if (!notification.userId && !notification.targetRole) {
        const dismissedBy = Array.isArray(
          notification.dismissedBy
        )
          ? [...notification.dismissedBy]
          : [];

        if (!dismissedBy.includes(userId)) {
          dismissedBy.push(userId);
        }

        return {
          ...notification,
          dismissedBy,
        };
      }

      // Notification milik user lain
      if (
        notification.userId &&
        String(notification.userId) !== userId
      ) {
        return notification;
      }

      // Notification role lain
      if (
        notification.targetRole &&
        notification.targetRole !== userRole
      ) {
        return notification;
      }

      // Notification milik user/role ini dihapus
      return null;
    })
    .filter(Boolean);

  saveNotifications(updated);

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
