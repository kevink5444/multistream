/* =========================================================
   SETTINGS ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

const settingsController = require("../controllers/settingsController");
const { requireAuth } = require("../middleware/authMiddleware");

/* =========================================================
   AUTHENTICATION
   ========================================================= */

// Semua endpoint Settings wajib login
router.use(requireAuth);

/* =========================================================
   GET SETTINGS
   GET /api/settings
   ========================================================= */

router.get("/", settingsController.getSettings);

/* =========================================================
   UPDATE SETTINGS
   PUT /api/settings
   ========================================================= */

router.put("/", settingsController.updateSettings);

/* =========================================================
   RESET SETTINGS
   POST /api/settings/reset
   ========================================================= */

router.post("/reset", settingsController.resetSettings);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;