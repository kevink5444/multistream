
/* =========================================================
   DESTINATION ROUTES
   ========================================================= */

const express = require("express");
const router = express.Router();

const destinationController = require("../controllers/destinationController");
const { requireAuth } = require("../middleware/authMiddleware");

// Semua endpoint Destination wajib login
router.use(requireAuth);

/* =========================================================
   GET ALL DESTINATIONS
   GET /api/destinations
   ========================================================= */

router.get("/", destinationController.getAllDestinations);

/* =========================================================
   GET DESTINATION BY ID
   GET /api/destinations/:id
   ========================================================= */

router.get("/:id", destinationController.getDestinationById);

/* =========================================================
   CREATE DESTINATION
   POST /api/destinations
   ========================================================= */

router.post("/", destinationController.createDestination);

/* =========================================================
   UPDATE DESTINATION
   PUT /api/destinations/:id
   ========================================================= */

router.put("/:id", destinationController.updateDestination);

/* =========================================================
   DELETE DESTINATION
   DELETE /api/destinations/:id
   ========================================================= */

router.delete("/:id", destinationController.deleteDestination);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;
