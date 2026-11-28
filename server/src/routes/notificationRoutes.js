
/* =========================================================
   NOTIFICATION ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
} = require("../controllers/notificationController");

const { requireAuth } = require("../middleware/authMiddleware");

/* =========================================================
   AUTHENTICATION
   ========================================================= */

router.use(requireAuth);

/* =========================================================
   ROUTES
   ========================================================= */

// Get notifications milik user yang sedang login
router.get("/", getNotifications);

// Mark all notifications as read
// Harus diletakkan sebelum route dengan parameter ID
router.patch("/read-all", markAllNotificationsAsRead);

// Mark one notification as read
router.patch("/:id/read", markNotificationAsRead);

// Clear notifications
router.delete("/", clearNotifications);

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = router;
