
/* =========================================================
   CHANNEL LIMIT REQUEST SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

const authService = require("./authService");
const activityLogService = require("./activityLogService");
const notificationService = require("./notificationService");

/* =========================================================
   DATA FILE
   ========================================================= */

const REQUESTS_FILE = path.join(
  __dirname,
  "../data/channel_limit_requests.json"
);

/* =========================================================
   ENSURE DATA FILE EXISTS
   ========================================================= */

const ensureRequestsFile = () => {
  const directory = path.dirname(REQUESTS_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }

  if (!fs.existsSync(REQUESTS_FILE)) {
    fs.writeFileSync(
      REQUESTS_FILE,
      JSON.stringify([], null, 2),
      "utf8"
    );
  }
};

/* =========================================================
   READ REQUESTS
   ========================================================= */

const getAllRequests = () => {
  ensureRequestsFile();

  try {
    const data = fs.readFileSync(
      REQUESTS_FILE,
      "utf8"
    );

    const requests = JSON.parse(data);

    if (!Array.isArray(requests)) {
      throw new Error(
        "Invalid channel limit request data."
      );
    }

    return requests;
  } catch (error) {
    console.error(
      "Read Channel Limit Requests Error:",
      error
    );

    throw new Error(
      "Failed to read channel limit requests."
    );
  }
};

/* =========================================================
   SAVE REQUESTS
   ========================================================= */

const saveRequests = (requests) => {
  ensureRequestsFile();

  /*
   * Gunakan nama temporary file yang unik
   * untuk mengurangi risiko konflik ketika
   * terdapat proses penyimpanan bersamaan.
   */

  const temporaryFile =
    `${REQUESTS_FILE}.${process.pid}.` +
    `${Date.now()}.` +
    `${Math.random().toString(36).slice(2)}.tmp`;

  try {
    fs.writeFileSync(
      temporaryFile,
      JSON.stringify(requests, null, 2),
      "utf8"
    );

    fs.renameSync(
      temporaryFile,
      REQUESTS_FILE
    );
  } catch (error) {
    /*
     * Cleanup temporary file tidak boleh
     * menutupi error utama.
     */

    try {
      if (
        fs.existsSync(temporaryFile)
      ) {
        fs.unlinkSync(temporaryFile);
      }
    } catch (cleanupError) {
      console.error(
        "Temporary File Cleanup Error:",
        cleanupError
      );
    }

    console.error(
      "Save Channel Limit Requests Error:",
      error
    );

    throw new Error(
      "Failed to save channel limit request."
    );
  }
};

/* =========================================================
   VALIDATE REQUEST STRUCTURE
   ========================================================= */

const validateRequestStructure = (
  request
) => {
  if (
    !request ||
    typeof request !== "object" ||
    Array.isArray(request)
  ) {
    throw new Error(
      "Invalid channel limit request."
    );
  }

  if (
    typeof request.id !== "string" ||
    !request.id.trim()
  ) {
    throw new Error(
      "Invalid channel limit request ID."
    );
  }

  if (
    typeof request.userId !== "string" ||
    !request.userId.trim()
  ) {
    throw new Error(
      "Invalid channel limit request owner."
    );
  }

  const validStatuses = [
    "pending",
    "approved",
    "rejected",
    "cancelled",
  ];

  if (
    !validStatuses.includes(
      request.status
    )
  ) {
    throw new Error(
      "Invalid channel limit request status."
    );
  }

  return true;
};

/* =========================================================
   CREATE ACTIVITY LOG
   ========================================================= */

const createChannelLimitActivityLog = ({
  userId,
  type = "info",
  title,
  description,
  metadata = null,
}) => {
  try {
    activityLogService.createLog({
      userId,

      type,

      category: "channel_limit",

      title,

      description,

      destination: "Channel Limit Request",

      metadata,
    });
  } catch (error) {
    /*
     * Activity logging should not undo
     * a successfully completed request action.
     */

    console.error(
      "[Channel Limit Activity Log] Error:",
      error.message
    );
  }
};

/* =========================================================
   CREATE NOTIFICATION
   ========================================================= */

const createChannelLimitNotification = ({
  userId = null,
  targetRole = null,
  type = "info",
  title,
  description,
  metadata = {},
}) => {
  try {
    notificationService.createNotification({
      type,

      category: "channel_limit",

      title,

      description,

      metadata,

      userId,

      targetRole,
    });
  } catch (error) {
    /*
     * Notification failure must not undo
     * a successfully completed request action.
     */

    console.error(
      "[Channel Limit Notification] Error:",
      error.message
    );
  }
};

/* =========================================================
   GET USER CURRENT LIMIT
   ========================================================= */

const getUserCurrentLimit = (userId) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  const user = authService.findUserById(
    userId
  );

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

  if (user.role === "admin") {
    return null;
  }

  const channelLimit = Number(
    user.channelLimit
  );

  if (
    !Number.isInteger(channelLimit) ||
    channelLimit < 1 ||
    channelLimit > 100
  ) {
    throw new Error(
      "Invalid user channel limit."
    );
  }

  return channelLimit;
};

/* =========================================================
   GET USER REQUESTS
   ========================================================= */

const getUserRequests = (userId) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  const requests = getAllRequests();

  return requests
    .filter(
      (request) =>
        request.userId === userId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
};

/* =========================================================
   GET ACTIVE USER REQUEST
   ========================================================= */

const getActiveUserRequest = (userId) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  const requests = getAllRequests();

  return requests.find(
    (request) =>
      request.userId === userId &&
      request.status === "pending"
  ) || null;
};

/* =========================================================
   CREATE REQUEST
   ========================================================= */

const createRequest = ({
  userId,
  requestedLimit,
  reason,
}) => {
  /* AUTHENTICATION VALIDATION */

  if (!userId) {
    throw new Error(
      "Authentication required."
    );
  }

  /* USER VALIDATION */

  const user = authService.findUserById(
    userId
  );

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

  if (user.role === "admin") {
    throw new Error(
      "Administrator does not need a channel limit request."
    );
  }

  if (user.status !== "active") {
    throw new Error(
      "Your account is not active."
    );
  }

  /* CURRENT LIMIT VALIDATION */

  const currentLimit = Number(
    user.channelLimit
  );

  if (
    !Number.isInteger(currentLimit) ||
    currentLimit < 1 ||
    currentLimit > 100
  ) {
    throw new Error(
      "Invalid current channel limit."
    );
  }

  /* REQUESTED LIMIT VALIDATION */

  const normalizedRequestedLimit = Number(
    requestedLimit
  );

  if (
    !Number.isInteger(
      normalizedRequestedLimit
    )
  ) {
    throw new Error(
      "Requested channel limit must be a whole number."
    );
  }

  if (
    normalizedRequestedLimit <=
    currentLimit
  ) {
    throw new Error(
      `Requested limit must be greater than your current limit of ${currentLimit}.`
    );
  }

  if (
    normalizedRequestedLimit > 100
  ) {
    throw new Error(
      "Requested channel limit cannot exceed 100."
    );
  }

  /* REASON VALIDATION */

  if (
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    throw new Error(
      "Reason for request is required."
    );
  }

  const trimmedReason = reason.trim();

  if (
    trimmedReason.length < 10
  ) {
    throw new Error(
      "Reason must be at least 10 characters."
    );
  }

  if (
    trimmedReason.length > 1000
  ) {
    throw new Error(
      "Reason cannot exceed 1000 characters."
    );
  }

  /* DUPLICATE PENDING VALIDATION */

  const requests = getAllRequests();

  const existingPendingRequest =
    requests.find(
      (request) =>
        request.userId === userId &&
        request.status === "pending"
    );

  if (existingPendingRequest) {
    throw new Error(
      "You already have a pending channel limit request."
    );
  }

  /* CREATE REQUEST */

  const now = new Date().toISOString();

  const newRequest = {
    id: `clr_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    userId: user.id,

    userName: user.name,

    userEmail: user.email,

    currentLimit,

    requestedLimit:
      normalizedRequestedLimit,

    reason: trimmedReason,

    status: "pending",

    adminNote: null,

    reviewedBy: null,

    reviewedAt: null,

    createdAt: now,

    updatedAt: now,
  };

  requests.push(newRequest);

  saveRequests(requests);

  /* =======================================================
     NOTIFY ADMIN
     ======================================================= */

  createChannelLimitNotification({
    targetRole: "admin",

    type: "info",

    title: "New Channel Limit Request",

    description:
      `${user.name} has requested an increase ` +
      `from ${currentLimit} to ` +
      `${normalizedRequestedLimit} channels.`,

    metadata: {
      requestId: newRequest.id,

      userId: user.id,

      userName: user.name,

      userEmail: user.email,

      currentLimit,

      requestedLimit:
        normalizedRequestedLimit,

      status: "pending",
    },
  });

  return newRequest;
};

/* =========================================================
   APPROVE REQUEST
   ========================================================= */

const approveRequest = ({
  requestId,
  adminUser,
}) => {
  /* REQUEST ID VALIDATION */

  if (!requestId) {
    throw new Error(
      "Request ID is required."
    );
  }

  /* ADMIN VALIDATION */

  if (
    !adminUser ||
    adminUser.role !== "admin"
  ) {
    throw new Error(
      "Administrator access required."
    );
  }

  /* FIND REQUEST */

  const requests = getAllRequests();

  const requestIndex = requests.findIndex(
    (request) =>
      request.id === requestId
  );

  if (requestIndex === -1) {
    throw new Error(
      "Channel limit request not found."
    );
  }

  const request = requests[requestIndex];

  /* REQUEST STRUCTURE VALIDATION */

  validateRequestStructure(request);

  /* REQUEST STATUS VALIDATION */

  if (request.status !== "pending") {
    throw new Error(
      `This request has already been ${request.status}.`
    );
  }

  /* USER VALIDATION */

  const user = authService.findUserById(
    request.userId
  );

  if (!user) {
    throw new Error(
      "Request owner no longer exists."
    );
  }

  if (user.role === "admin") {
    throw new Error(
      "Cannot approve a channel limit request for an administrator."
    );
  }

  if (user.status !== "active") {
    throw new Error(
      "Cannot approve a channel limit request for an inactive user."
    );
  }

  /* REQUESTED LIMIT VALIDATION */

  const requestedLimit = Number(
    request.requestedLimit
  );

  if (
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > 100
  ) {
    throw new Error(
      "Invalid requested channel limit."
    );
  }

  /* CURRENT USER LIMIT VALIDATION */

  const currentLimit = Number(
    user.channelLimit
  );

  if (
    !Number.isInteger(currentLimit) ||
    currentLimit < 1 ||
    currentLimit > 100
  ) {
    throw new Error(
      "User has an invalid channel limit."
    );
  }

  /* LIMIT COMPARISON */

  if (
    requestedLimit <= currentLimit
  ) {
    throw new Error(
      "Requested limit must be greater than the user's current limit."
    );
  }

  /* =======================================================
     UPDATE USER CHANNEL LIMIT
     ======================================================= */

  const updatedUser =
    authService.updateUserChannelLimit(
      user.id,
      requestedLimit
    );

  if (!updatedUser) {
    throw new Error(
      "Failed to update user channel limit."
    );
  }

  /* =======================================================
     UPDATE REQUEST STATUS
     ======================================================= */

  const now = new Date().toISOString();

  const approvedRequest = {
    ...request,

    status: "approved",

    /*
     * Simpan current limit terbaru
     * sebelum proses approval.
     */

    currentLimit,

    adminNote: null,

    reviewedBy:
      adminUser.id ||
      adminUser._id ||
      null,

    reviewedAt: now,

    updatedAt: now,
  };

  requests[requestIndex] =
    approvedRequest;

  /* =======================================================
     SAVE REQUEST
     ======================================================= */

  try {
    saveRequests(requests);
  } catch (saveError) {
    /*
     * COMPENSATING ROLLBACK
     *
     * Jika request gagal disimpan setelah
     * user channel limit berhasil diperbarui,
     * coba kembalikan channel limit ke nilai
     * sebelum approval.
     */

    try {
      authService.updateUserChannelLimit(
        user.id,
        currentLimit
      );

      console.error(
        "[Channel Limit Approval] User limit rollback successful.",
        {
          userId: user.id,

          previousLimit: currentLimit,

          requestedLimit,
        }
      );
    } catch (rollbackError) {
      /*
       * Jika rollback juga gagal,
       * catat kedua error untuk investigasi.
       */

      console.error(
        "[Channel Limit Approval] Rollback failed.",
        {
          saveError:
            saveError.message,

          rollbackError:
            rollbackError.message,

          userId: user.id,

          previousLimit: currentLimit,

          requestedLimit,
        }
      );

      throw new Error(
        "Approval failed and user channel limit rollback also failed. Manual data verification is required."
      );
    }

    throw saveError;
  }

  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  createChannelLimitActivityLog({
    userId: request.userId,

    type: "success",

    title: "Channel Limit Request Approved",

    description:
      `Your channel limit request has been approved. ` +
      `Your channel limit has been increased from ` +
      `${currentLimit} to ${requestedLimit} channels.`,

    metadata: {
      requestId: request.id,

      previousLimit: currentLimit,

      newLimit: requestedLimit,

      reviewedBy:
        adminUser.id ||
        adminUser._id ||
        null,

      reviewedByName:
        adminUser.name ||
        null,

      status: "approved",
    },
  });

  /* =======================================================
     NOTIFY REQUEST OWNER
     ======================================================= */

  createChannelLimitNotification({
    userId: request.userId,

    type: "success",

    title: "Channel Limit Request Approved",

    description:
      `Your channel limit request has been approved. ` +
      `Your channel limit is now ${requestedLimit} channels.`,

    metadata: {
      requestId: request.id,

      previousLimit: currentLimit,

      newLimit: requestedLimit,

      status: "approved",
    },
  });

  return {
    request: approvedRequest,

    user: updatedUser,
  };
};

/* =========================================================
   REJECT REQUEST
   ========================================================= */

const rejectRequest = ({
  requestId,
  adminUser,
  adminNote = "",
}) => {
  /* REQUEST ID VALIDATION */

  if (!requestId) {
    throw new Error(
      "Request ID is required."
    );
  }

  /* ADMIN VALIDATION */

  if (
    !adminUser ||
    adminUser.role !== "admin"
  ) {
    throw new Error(
      "Administrator access required."
    );
  }

  /* FIND REQUEST */

  const requests = getAllRequests();

  const requestIndex = requests.findIndex(
    (request) =>
      request.id === requestId
  );

  if (requestIndex === -1) {
    throw new Error(
      "Channel limit request not found."
    );
  }

  const request = requests[requestIndex];

  /* REQUEST STRUCTURE VALIDATION */

  validateRequestStructure(request);

  /* REQUEST STATUS VALIDATION */

  if (request.status !== "pending") {
    throw new Error(
      `This request has already been ${request.status}.`
    );
  }

  /* ADMIN NOTE VALIDATION */

  if (
    typeof adminNote !== "string"
  ) {
    throw new Error(
      "Admin note must be a string."
    );
  }

  const trimmedAdminNote =
    adminNote.trim();

  if (
    trimmedAdminNote.length > 1000
  ) {
    throw new Error(
      "Admin note cannot exceed 1000 characters."
    );
  }

  /* UPDATE REQUEST */

  const now = new Date().toISOString();

  const rejectedRequest = {
    ...request,

    status: "rejected",

    adminNote:
      trimmedAdminNote || null,

    reviewedBy:
      adminUser.id ||
      adminUser._id ||
      null,

    reviewedAt: now,

    updatedAt: now,
  };

  requests[requestIndex] =
    rejectedRequest;

  /* SAVE REQUEST */

  saveRequests(requests);

  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  createChannelLimitActivityLog({
    userId: request.userId,

    type: "warning",

    title: "Channel Limit Request Rejected",

    description:
      trimmedAdminNote
        ? `Your channel limit request has been rejected. Admin note: ${trimmedAdminNote}`
        : "Your channel limit request has been rejected.",

    metadata: {
      requestId: request.id,

      requestedLimit:
        request.requestedLimit,

      currentLimit:
        request.currentLimit,

      adminNote:
        trimmedAdminNote || null,

      reviewedBy:
        adminUser.id ||
        adminUser._id ||
        null,

      reviewedByName:
        adminUser.name ||
        null,

      status: "rejected",
    },
  });

  /* =======================================================
     NOTIFY REQUEST OWNER
     ======================================================= */

  createChannelLimitNotification({
    userId: request.userId,

    type: "warning",

    title: "Channel Limit Request Rejected",

    description:
      trimmedAdminNote
        ? `Your channel limit request has been rejected. Admin note: ${trimmedAdminNote}`
        : "Your channel limit request has been rejected.",

    metadata: {
      requestId: request.id,

      currentLimit:
        request.currentLimit,

      requestedLimit:
        request.requestedLimit,

      adminNote:
        trimmedAdminNote || null,

      status: "rejected",
    },
  });

  return rejectedRequest;
};

/* =========================================================
   CANCEL REQUEST
   ========================================================= */

const cancelRequest = ({
  requestId,
  userId,
}) => {
  /* AUTHENTICATION VALIDATION */

  if (!requestId || !userId) {
    throw new Error(
      "Request ID and authentication are required."
    );
  }

  /* FIND REQUEST */

  const requests = getAllRequests();

  const requestIndex = requests.findIndex(
    (request) =>
      request.id === requestId
  );

  if (requestIndex === -1) {
    throw new Error(
      "Channel limit request not found."
    );
  }

  const request = requests[requestIndex];

  /* REQUEST STRUCTURE VALIDATION */

  validateRequestStructure(request);

  /* USER OWNERSHIP VALIDATION */

  if (request.userId !== userId) {
    throw new Error(
      "You are not allowed to cancel this request."
    );
  }

  /* STATUS VALIDATION */

  if (request.status !== "pending") {
    throw new Error(
      "Only pending requests can be cancelled."
    );
  }

  /* UPDATE REQUEST */

  const now = new Date().toISOString();

  const cancelledRequest = {
    ...request,

    status: "cancelled",

    updatedAt: now,
  };

  requests[requestIndex] =
    cancelledRequest;

  /* SAVE REQUEST */

  saveRequests(requests);

  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  createChannelLimitActivityLog({
    userId: request.userId,

    type: "info",

    title: "Channel Limit Request Cancelled",

    description:
      `You cancelled your request to increase ` +
      `your channel limit from ${request.currentLimit} ` +
      `to ${request.requestedLimit} channels.`,

    metadata: {
      requestId: request.id,

      currentLimit:
        request.currentLimit,

      requestedLimit:
        request.requestedLimit,

      status: "cancelled",
    },
  });

  /* =======================================================
     NOTIFY ADMIN
     ======================================================= */

  createChannelLimitNotification({
    targetRole: "admin",

    type: "info",

    title: "Channel Limit Request Cancelled",

    description:
      `${request.userName} cancelled their ` +
      `channel limit request.`,

    metadata: {
      requestId: request.id,

      userId: request.userId,

      userName: request.userName,

      requestedLimit:
        request.requestedLimit,

      status: "cancelled",
    },
  });

  return cancelledRequest;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  getAllRequests,

  getUserRequests,

  getActiveUserRequest,

  getUserCurrentLimit,

  createRequest,

  approveRequest,

  rejectRequest,

  cancelRequest,
};
