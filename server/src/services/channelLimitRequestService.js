
/* =========================================================
   CHANNEL LIMIT REQUEST SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

const authService = require("./authService");

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

  const temporaryFile = `${REQUESTS_FILE}.tmp`;

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
    if (fs.existsSync(temporaryFile)) {
      fs.unlinkSync(temporaryFile);
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
   GET USER CURRENT LIMIT
   ========================================================= */

const getUserCurrentLimit = (userId) => {
  const user = authService.findUserById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role === "admin") {
    return null;
  }

  const channelLimit = Number(user.channelLimit);

  if (
    !Number.isInteger(channelLimit) ||
    channelLimit < 1
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
  const requests = getAllRequests();

  return requests
    .filter(
      (request) => request.userId === userId
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
  const requests = getAllRequests();

  return requests.find(
    (request) =>
      request.userId === userId &&
      request.status === "pending"
  );
};

/* =========================================================
   CREATE REQUEST
   ========================================================= */

const createRequest = ({
  userId,
  requestedLimit,
  reason,
}) => {
  if (!userId) {
    throw new Error(
      "Authentication required."
    );
  }

  const user = authService.findUserById(userId);

  if (!user) {
    throw new Error("User not found.");
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

  const currentLimit = Number(
    user.channelLimit
  );

  if (
    !Number.isInteger(currentLimit) ||
    currentLimit < 1
  ) {
    throw new Error(
      "Invalid current channel limit."
    );
  }

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
    normalizedRequestedLimit <= currentLimit
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

  if (
    typeof reason !== "string" ||
    !reason.trim()
  ) {
    throw new Error(
      "Reason for request is required."
    );
  }

  const trimmedReason = reason.trim();

  if (trimmedReason.length < 10) {
    throw new Error(
      "Reason must be at least 10 characters."
    );
  }

  if (trimmedReason.length > 1000) {
    throw new Error(
      "Reason cannot exceed 1000 characters."
    );
  }

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

  return newRequest;
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
};
