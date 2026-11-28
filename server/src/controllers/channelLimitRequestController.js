
/* =========================================================
   CHANNEL LIMIT REQUEST CONTROLLER
   ========================================================= */

const channelLimitRequestService = require(
  "../services/channelLimitRequestService"
);

/* =========================================================
   GET AUTHENTICATED USER
   ========================================================= */

const getAuthenticatedUser = (req) => {
  if (
    !req.session ||
    !req.session.user
  ) {
    return null;
  }

  return req.session.user;
};

/* =========================================================
   CREATE REQUEST
   POST /api/channel-limit-requests
   ========================================================= */

const createRequest = (req, res) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const userId =
      authenticatedUser.id;

    const {
      requestedLimit,
      reason,
    } = req.body || {};

    const request =
      channelLimitRequestService.createRequest({
        userId,
        requestedLimit,
        reason,
      });

    return res.status(201).json({
      success: true,

      message:
        "Channel limit request submitted successfully.",

      data: request,
    });
  } catch (error) {
    console.error(
      "Create Channel Limit Request Error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   GET MY REQUESTS
   GET /api/channel-limit-requests/my
   ========================================================= */

const getMyRequests = (req, res) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const userId =
      authenticatedUser.id;

    const requests =
      channelLimitRequestService.getUserRequests(
        userId
      );

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error(
      "Get My Channel Limit Requests Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve your channel limit requests.",
    });
  }
};

/* =========================================================
   GET MY REQUEST STATUS
   GET /api/channel-limit-requests/my/status
   ========================================================= */

const getMyStatus = (req, res) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const userId =
      authenticatedUser.id;

    const currentLimit =
      channelLimitRequestService.getUserCurrentLimit(
        userId
      );

    const activeRequest =
      channelLimitRequestService.getActiveUserRequest(
        userId
      );

    return res.json({
      success: true,

      data: {
        currentLimit,

        activeRequest:
          activeRequest || null,
      },
    });
  } catch (error) {
    console.error(
      "Get Channel Limit Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve channel limit status.",
    });
  }
};

/* =========================================================
   GET ALL REQUESTS
   GET /api/channel-limit-requests/admin
   ========================================================= */

const getAllRequests = (req, res) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    /* DEFENSIVE ADMIN VALIDATION */

    if (
      authenticatedUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Administrator access required.",
      });
    }

    const requests =
      channelLimitRequestService.getAllRequests();

    const sortedRequests =
      [...requests].sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

    return res.json({
      success: true,
      data: sortedRequests,
    });
  } catch (error) {
    console.error(
      "Get All Channel Limit Requests Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve channel limit requests.",
    });
  }
};

/* =========================================================
   APPROVE REQUEST
   PATCH /api/channel-limit-requests/:requestId/approve
   ========================================================= */

const approveRequest = (req, res) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    /* DEFENSIVE ADMIN VALIDATION */

    if (
      authenticatedUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Administrator access required.",
      });
    }

    const requestId =
      req.params.requestId;

    const adminUser =
      authenticatedUser;

    const result =
      channelLimitRequestService.approveRequest({
        requestId,
        adminUser,
      });

    return res.json({
      success: true,

      message:
        "Channel limit request approved successfully.",

      data: result,
    });
  } catch (error) {
    console.error(
      "Approve Channel Limit Request Error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   REJECT REQUEST
   PATCH /api/channel-limit-requests/:requestId/reject
   ========================================================= */

const rejectRequest = (req, res) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    /* DEFENSIVE ADMIN VALIDATION */

    if (
      authenticatedUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Administrator access required.",
      });
    }

    const requestId =
      req.params.requestId;

    const adminUser =
      authenticatedUser;

    /*
     * SUPPORT ADMIN NOTE
     *
     * adminNote merupakan format utama.
     * note dipertahankan untuk kompatibilitas
     * dengan payload versi sebelumnya.
     */

    const adminNote =
      req.body?.adminNote ??
      req.body?.note ??
      "";

    const request =
      channelLimitRequestService.rejectRequest({
        requestId,
        adminUser,
        adminNote,
      });

    return res.json({
      success: true,

      message:
        "Channel limit request rejected successfully.",

      data: request,
    });
  } catch (error) {
    console.error(
      "Reject Channel Limit Request Error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   CANCEL REQUEST
   PATCH /api/channel-limit-requests/:requestId/cancel
   ========================================================= */

const cancelRequest = (req, res) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const requestId =
      req.params.requestId;

    const userId =
      authenticatedUser.id;

    const request =
      channelLimitRequestService.cancelRequest({
        requestId,
        userId,
      });

    return res.json({
      success: true,

      message:
        "Channel limit request cancelled successfully.",

      data: request,
    });
  } catch (error) {
    console.error(
      "Cancel Channel Limit Request Error:",
      error.message
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
  createRequest,

  getMyRequests,

  getMyStatus,

  getAllRequests,

  approveRequest,

  rejectRequest,

  cancelRequest,
};
