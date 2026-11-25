/* =========================================================
   AUTH CONTROLLER
   ========================================================= */
const emailService = require("../services/emailService");
const authService = require("../services/authService");

/* =========================================================
   REGISTER
   ========================================================= */

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
    } = req.body;

    /* VALIDATION */

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters.",
      });
    }

    /* EMAIL VALIDATION */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    /* PASSWORD VALIDATION */

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    /* CREATE USER */

    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    /* CREATE SESSION */

    req.session.regenerate((error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to create session.",
        });
      }

      req.session.user = user;

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            success: false,
            message: "Failed to save session.",
          });
        }

        return res.status(201).json({
          success: true,
          message: "Registration successful.",
          data: {
            user,
          },
        });
      });
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   LOGIN
   ========================================================= */

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    /* VALIDATION */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    /* FIND USER */

    const user = authService.findUserByEmail(
      email.trim()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    /* CHECK ACCOUNT STATUS */

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    /* VERIFY PASSWORD */

    const passwordValid =
      await authService.verifyPassword(
        password,
        user.passwordHash
      );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    /* SAFE USER DATA */

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      channelLimit: user.channelLimit,
      status: user.status,
      createdAt: user.createdAt,
    };

    /* REGENERATE SESSION */

    req.session.regenerate((error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to create session.",
        });
      }

      req.session.user = safeUser;

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            success: false,
            message: "Failed to save session.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Login successful.",
          data: {
            user: safeUser,
          },
        });
      });
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

/* =========================================================
   GET CURRENT USER
   ========================================================= */

const getCurrentUser = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.session.user,
    },
  });
};

/* =========================================================
   LOGOUT
   ========================================================= */

const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout Error:", error);

      return res.status(500).json({
        success: false,
        message: "Logout failed.",
      });
    }

    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  });
};
/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // VALIDATION
    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // NORMALIZE EMAIL
    const normalizedEmail =
      email.trim().toLowerCase();

    // CREATE RESET TOKEN
    const resetData =
      await authService.createPasswordResetToken(
        normalizedEmail
      );

    /*
      SECURITY:
      Always return the same response whether
      the email exists or not.
    */

    const responseMessage =
      "If an account with that email exists, " +
      "a password reset link has been sent.";

    // EMAIL NOT FOUND
    if (!resetData) {
      return res.status(200).json({
        success: true,
        message: responseMessage,
      });
    }

    // FRONTEND URL
    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    // CREATE RESET URL
    const resetUrl =
      `${frontendUrl}/?resetToken=${encodeURIComponent(
        resetData.resetToken
      )}`;

    // SEND EMAIL
    await emailService.sendPasswordResetEmail({
      email: resetData.user.email,
      name: resetData.user.name,
      resetUrl,
    });

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: responseMessage,
    });

  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request.",
    });
  }
};

/* =========================================================
   RESET PASSWORD
   ========================================================= */

const resetPassword = async (req, res) => {
  try {
    const {
      token,
      password,
      confirmPassword,
    } = req.body;

    /* VALIDATION */

    if (
      !token ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    /* RESET PASSWORD */

    await authService.resetPassword({
      token,
      password,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password successfully reset. Please sign in.",
    });
  } catch (error) {
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
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
};