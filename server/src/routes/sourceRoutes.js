/* =========================================================
   SOURCE ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

/* =========================================================
   CONTROLLER
   ========================================================= */

const {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
} = require("../controllers/sourceController");

/* =========================================================
   MIDDLEWARE
   ========================================================= */

const { requireAuth } = require("../middleware/authMiddleware");

/* =========================================================
   AUTHENTICATION
   ========================================================= */

// Semua endpoint Sources wajib login
router.use(requireAuth);

/* =========================================================
   ROUTES
   ========================================================= */

// GET all sources
// Admin: seluruh Sources
// User: Sources miliknya sendiri
router.get("/", getAllSources);

// GET source by ID
router.get("/:id", getSourceById);

// CREATE source
router.post("/", createSource);

// UPDATE source
router.put("/:id", updateSource);

// DELETE source
router.delete("/:id", deleteSource);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;