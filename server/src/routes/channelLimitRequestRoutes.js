/* =========================================================
   CHANNEL LIMIT REQUEST ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
  requireAuth,
} = require("../middleware/authMiddleware");

const {
  requireAdmin,
} = require("../middleware/adminMiddleware");

const channelLimitRequestController = require(
  "../controllers/channelLimitRequestController"
);

/* =========================================================
   AUTHENTICATION
   All routes require authentication
   ========================================================= */

router.use(requireAuth);

/* =========================================================
   USER ROUTES
   ========================================================= */

/*
   GET MY STATUS
   GET /api/channel-limit-requests/my/status
*/

router.get(
  "/my/status",
  channelLimitRequestController.getMyStatus
);

/*
   GET MY REQUESTS
   GET /api/channel-limit-requests/my
*/

router.get(
  "/my",
  channelLimitRequestController.getMyRequests
);

/*
   CREATE REQUEST
   POST /api/channel-limit-requests
*/

router.post(
  "/",
  channelLimitRequestController.createRequest
);

/*
   CANCEL REQUEST
   PATCH /api/channel-limit-requests/:requestId/cancel
*/

router.patch(
  "/:requestId/cancel",
  channelLimitRequestController.cancelRequest
);

/* =========================================================
   ADMIN ROUTES
   ========================================================= */

/*
   GET ALL REQUESTS
   GET /api/channel-limit-requests/admin

   Requires:
   - Authentication
   - Admin role
*/

router.get(
  "/admin",
  requireAdmin,
  channelLimitRequestController.getAllRequests
);

/*
   APPROVE REQUEST
   PATCH /api/channel-limit-requests/:requestId/approve

   Requires:
   - Authentication
   - Admin role
*/

router.patch(
  "/:requestId/approve",
  requireAdmin,
  channelLimitRequestController.approveRequest
);

/*
   REJECT REQUEST
   PATCH /api/channel-limit-requests/:requestId/reject

   Requires:
   - Authentication
   - Admin role
*/

router.patch(
  "/:requestId/reject",
  requireAdmin,
  channelLimitRequestController.rejectRequest
);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;