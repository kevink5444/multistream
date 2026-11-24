/* =========================================================
   AUTH MIDDLEWARE
   ========================================================= */

/* =========================================================
   AUTH MIDDLEWARE
   ========================================================= */

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  next();
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  requireAuth,
};