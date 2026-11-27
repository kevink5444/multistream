
/* =========================================================
   CHANNEL LIMIT REQUEST ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
  requireAuth,
} = require("../middleware/authMiddleware");

const channelLimitRequestController = require(
  "../controllers/channelLimitRequestController"
);

/* =========================================================
   AUTHENTICATION
   ========================================================= */

router.use(requireAuth);

/* =========================================================
   GET MY STATUS
   ========================================================= */

router.get(
  "/my/status",
  channelLimitRequestController.getMyStatus
);

/* =========================================================
   GET MY REQUESTS
   ========================================================= */

router.get(
  "/my",
  channelLimitRequestController.getMyRequests
);

/* =========================================================
   CREATE REQUEST
   ========================================================= */

router.post(
  "/",
  channelLimitRequestController.createRequest
);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;
