
/* =========================================================
   CHANNEL LIMIT REQUEST CONTROLLER
   ========================================================= */

const channelLimitRequestService = require(
  "../services/channelLimitRequestService"
);

/* =========================================================
   CREATE REQUEST
   POST /api/channel-limit-requests
   ========================================================= */

const createRequest = (req, res) => {
  try {
    const userId = req.session.user.id;

    const {
      requestedLimit,
      reason,
    } = req.body;

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
    const userId = req.session.user.id;

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
    const userId = req.session.user.id;

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
        activeRequest: activeRequest || null,
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
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
  createRequest,
  getMyRequests,
  getMyStatus,
};
