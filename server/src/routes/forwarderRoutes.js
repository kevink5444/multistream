
/* =========================================================
   FORWARDER ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

const {
  getAllForwarderStatuses,
} = require("../controllers/forwarderController");

const { requireAuth } = require("../middleware/authMiddleware");

// Semua endpoint Forwarder wajib login
router.use(requireAuth);

/* =========================================================
   GET ALL FORWARDER STATUSES
   GET /api/forwarders/status
   ========================================================= */

router.get("/status", getAllForwarderStatuses);

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = router;
