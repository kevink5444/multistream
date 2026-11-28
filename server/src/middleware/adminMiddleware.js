/* =========================================================
   ADMIN MIDDLEWARE
   ========================================================= */

const authService = require("../services/authService");

/* =========================================================
   REQUIRE ADMIN
   ========================================================= */

const requireAdmin = (req, res, next) => {
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
       CHECK USER SESSION
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

    /* =====================================================
       GET CURRENT USER
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
       CHECK ADMIN ROLE
       ===================================================== */

    if (currentUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    /* =====================================================
       REFRESH SESSION USER
       ===================================================== */

    req.session.user = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      channelLimit: currentUser.channelLimit,
      status: currentUser.status,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
    };

    /* =====================================================
       ADMIN AUTHENTICATION SUCCESS
       ===================================================== */

    next();

  } catch (error) {
    console.error(
      "Admin Middleware Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Admin authentication verification failed.",
    });
  }
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  requireAdmin,
};