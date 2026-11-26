/* =========================================================
   ACTIVITY LOG ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

const {
  getAllActivityLogs,
  getActivityLogsByType,
  createActivityLog,
  clearActivityLogs,
} = require("../controllers/activityLogController");

const { requireAuth } = require("../middleware/authMiddleware");

/* =========================================================
   AUTHENTICATION
   ========================================================= */

router.use(requireAuth);

/* =========================================================
   ROUTES
   ========================================================= */

// GET all activity logs
router.get("/", getAllActivityLogs);

// GET logs by type
router.get("/type/:type", getActivityLogsByType);

// CREATE activity log
router.post("/", createActivityLog);

// DELETE all activity logs
router.delete("/", clearActivityLogs);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;