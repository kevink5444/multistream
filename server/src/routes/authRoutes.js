/* =========================================================
   AUTH ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const { requireAuth } = require("../middleware/authMiddleware");

const rateLimit = require("express-rate-limit");

/* =========================================================
   LOGIN RATE LIMIT
   ========================================================= */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many login attempts. Please try again later.",
  },
});

/* =========================================================
   REGISTER RATE LIMIT
   ========================================================= */

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many registration attempts. Please try again later.",
  },
});

/* =========================================================
   PASSWORD RESET RATE LIMIT
   ========================================================= */

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password reset attempts. Please try again later.",
  },
});

/* =========================================================
   REGISTER
   POST /api/auth/register
   ========================================================= */

router.post(
  "/register",
  registerLimiter,
  authController.register
);

/* =========================================================
   LOGIN
   POST /api/auth/login
   ========================================================= */

router.post(
  "/login",
  loginLimiter,
  authController.login
);

/* =========================================================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
   ========================================================= */

router.post(
  "/forgot-password",
  passwordResetLimiter,
  authController.forgotPassword
);

/* =========================================================
   RESET PASSWORD
   POST /api/auth/reset-password
   ========================================================= */

router.post(
  "/reset-password",
  passwordResetLimiter,
  authController.resetPassword
);

/* =========================================================
   CURRENT USER
   GET /api/auth/me
   ========================================================= */

router.get(
  "/me",
  requireAuth,
  authController.getCurrentUser
);
/* =========================================================
   UPDATE PROFILE
   PUT /api/auth/profile
   ========================================================= */

router.put(
  "/profile",
  requireAuth,
  authController.updateProfile
);
/* =========================================================
   LOGOUT
   POST /api/auth/logout
   ========================================================= */

router.post(
  "/logout",
  requireAuth,
  authController.logout
);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;