/* =========================================================
   AUTH MIDDLEWARE
   ========================================================= */

const requireAuth = (req, res, next) => {
  console.log("------------------------------------");
  console.log("AUTH DEBUG");
  console.log("Session ID:", req.sessionID);
  console.log("Session Data:", req.session);
  console.log("Session User:", req.session?.user);
  console.log("------------------------------------");

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