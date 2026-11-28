/* =========================================================
   AUTH MIDDLEWARE
   ========================================================= */

const authService = require("../services/authService");

/* =========================================================
   REQUIRE AUTHENTICATION
   ========================================================= */

const requireAuth = (req, res, next) => {
  try {
    /* =====================================================
       CHECK SESSION
       ===================================================== */

    if (
      !req.session ||
      !req.session.user
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /* =====================================================
       CHECK SESSION USER STRUCTURE
       ===================================================== */

    const sessionUser = req.session.user;

    if (
      typeof sessionUser !== "object" ||
      Array.isArray(sessionUser)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
      });
    }

    /* =====================================================
       CHECK USER ID
       ===================================================== */

    const userId = sessionUser.id;

    if (
      userId === undefined ||
      userId === null ||
      userId === ""
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
      });
    }

    if (
      typeof userId !== "string" &&
      typeof userId !== "number"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
      });
    }

    if (
      typeof userId === "string" &&
      userId.trim() === ""
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
      });
    }

    /* =====================================================
       FIND CURRENT USER
       ===================================================== */

    const currentUser =
      authService.findUserById(userId);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    /* =====================================================
       CHECK ACCOUNT STATUS
       ===================================================== */

    if (currentUser.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    /* =====================================================
       REFRESH SESSION USER DATA
       ===================================================== */

    const safeUser = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      channelLimit: currentUser.channelLimit,
      status: currentUser.status,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
    };

    /*
     * Update session with current user data.
     *
     * This prevents outdated session data when:
     * - User profile is updated
     * - User role changes
     * - Channel limit changes
     * - Account status changes
     */

    req.session.user = safeUser;

    /* =====================================================
       AUTHENTICATION SUCCESS
       ===================================================== */

    next();

  } catch (error) {
    console.error(
      "Authentication Middleware Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authentication verification failed.",
    });
  }
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  requireAuth,
};