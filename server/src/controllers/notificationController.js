
/* =========================================================
   NOTIFICATION CONTROLLER
   ========================================================= */

const notificationService = require("../services/notificationService");

/* =========================================================
   GET NOTIFICATIONS
   ========================================================= */

const getNotifications = (req, res) => {
  try {
    const currentUser = req.session.user;

    const notifications =
      notificationService.getAllNotifications(currentUser);

    res.status(200).json({
      success: true,
      total: notifications.length,
      unread: notifications.filter((item) => !item.read).length,
      data: notifications,
    });
  } catch (error) {
    console.error("[Notification Controller]", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
    });
  }
};

/* =========================================================
   MARK ONE AS READ
   ========================================================= */

const markNotificationAsRead = (req, res) => {
  try {
    const currentUser = req.session.user;

    const notification = notificationService.markAsRead(
      req.params.id,
      currentUser
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("[Notification Controller]", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

/* =========================================================
   MARK ALL AS READ
   ========================================================= */

const markAllNotificationsAsRead = (req, res) => {
  try {
    const currentUser = req.session.user;

    const notifications =
      notificationService.markAllAsRead(currentUser);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("[Notification Controller]", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

/* =========================================================
   CLEAR NOTIFICATIONS
   ========================================================= */

const clearNotifications = (req, res) => {
  try {
    const currentUser = req.session.user;

    notificationService.clearNotifications(currentUser);

    res.status(200).json({
      success: true,
      message: "Notifications cleared",
    });
  } catch (error) {
    console.error("[Notification Controller]", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
};
