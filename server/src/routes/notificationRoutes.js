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

router.get("/", getNotifications);

// Harus sebelum route dengan parameter ID
router.patch("/read-all", markAllNotificationsAsRead);

router.patch("/:id/read", markNotificationAsRead);

router.delete("/", clearNotifications);

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = router;