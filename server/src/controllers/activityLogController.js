/* =========================================================
   ACTIVITY LOG CONTROLLER
   ========================================================= */

const activityLogService = require("../services/activityLogService");

/* =========================================================
   GET ALL ACTIVITY LOGS
   GET /api/activity-logs
   ========================================================= */

const getAllActivityLogs = (req, res) => {
  try {
    const user = req.session.user;

    const logs = activityLogService.getAllLogs(user);

    res.status(200).json({
      success: true,
      total: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error(
      "[Activity Log Controller] Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve activity logs",
    });
  }
};

/* =========================================================
   GET ACTIVITY LOGS BY TYPE
   GET /api/activity-logs/type/:type
   ========================================================= */

const getActivityLogsByType = (req, res) => {
  try {
    const { type } = req.params;

    const user = req.session.user;

    const allowedTypes = [
      "success",
      "warning",
      "error",
      "info",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity log type",
      });
    }

    const logs = activityLogService.getLogsByType(
      type,
      user
    );

    res.status(200).json({
      success: true,
      total: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error(
      "[Activity Log Controller] Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve activity logs",
    });
  }
};

/* =========================================================
   CREATE ACTIVITY LOG
   POST /api/activity-logs
   ========================================================= */

const createActivityLog = (req, res) => {
  try {
    const user = req.session.user;

    const {
      type,
      category,
      title,
      description,
      destination,
      metadata,
    } = req.body;

    /* =====================================================
       VALIDATION
       ===================================================== */

    const allowedTypes = [
      "success",
      "warning",
      "error",
      "info",
    ];

    const allowedCategories = [
      "system",
      "destination",
      "source",
      "streaming",
      "forwarder",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity log type",
      });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity log category",
      });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Activity log title is required",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity log description",
      });
    }

    if (
      metadata !== undefined &&
      (
        typeof metadata !== "object" ||
        metadata === null ||
        Array.isArray(metadata)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity log metadata",
      });
    }

    /* =====================================================
       CREATE LOG
       ===================================================== */

    const newLog = activityLogService.createLog({
      // User ID berasal dari session, bukan request body
      userId: user.id ?? user._id,

      type,
      category,

      title: title.trim(),

      description: description || "",

      destination: destination || "System",

      metadata: metadata || {},
    });

    /* =====================================================
       RESPONSE
       ===================================================== */

    res.status(201).json({
      success: true,
      message: "Activity log created successfully",
      data: newLog,
    });
  } catch (error) {
    console.error(
      "[Activity Log Controller] Create error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to create activity log",
    });
  }
};

/* =========================================================
   CLEAR ACTIVITY LOGS
   DELETE /api/activity-logs
   ADMIN ONLY
   ========================================================= */

const clearActivityLogs = (req, res) => {
  try {
    const user = req.session.user;

    /* =====================================================
       ADMIN AUTHORIZATION
       ===================================================== */

    if (user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin access required.",
      });
    }

    /* =====================================================
       CLEAR LOGS
       ===================================================== */

    activityLogService.clearLogs();

    res.status(200).json({
      success: true,
      message: "Activity logs cleared successfully",
    });
  } catch (error) {
    console.error(
      "[Activity Log Controller] Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to clear activity logs",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
  getAllActivityLogs,
  getActivityLogsByType,
  clearActivityLogs,
  createActivityLog,
};