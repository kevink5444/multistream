/* =========================================================
   ACTIVITY LOG ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

/* =========================================================
   CONTROLLER
   ========================================================= */

const {
  getAllActivityLogs,
  getActivityLogsByType,
  createActivityLog,
  clearActivityLogs,
} = require("../controllers/activityLogController");

/* =========================================================
   MIDDLEWARE
   ========================================================= */

const { requireAuth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

/* =========================================================
   AUTHENTICATION
   ========================================================= */

// Semua endpoint Activity Log wajib login
router.use(requireAuth);

/* =========================================================
   GET ALL ACTIVITY LOGS
   ========================================================= */

// Admin:
// Menampilkan seluruh Activity Log

// User:
// Menampilkan Activity Log miliknya sendiri

router.get("/", getAllActivityLogs);

/* =========================================================
   GET ACTIVITY LOGS BY TYPE
   ========================================================= */

// Admin:
// Menampilkan seluruh log berdasarkan tipe

// User:
// Menampilkan log miliknya berdasarkan tipe

router.get("/type/:type", getActivityLogsByType);

/* =========================================================
   CREATE ACTIVITY LOG
   ========================================================= */

// User ID otomatis menggunakan session login
// User tidak dapat menentukan userId dari request body

router.post("/", createActivityLog);

/* =========================================================
   CLEAR ACTIVITY LOGS
   ========================================================= */

// Hanya Admin yang dapat menghapus seluruh Activity Log

router.delete("/", requireAdmin, clearActivityLogs);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;