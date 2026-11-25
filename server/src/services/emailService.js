
/* =========================================================
   EMAIL SERVICE
   ========================================================= */

const nodemailer = require("nodemailer");

/* =========================================================
   SMTP CONFIGURATION
   ========================================================= */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),

  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =========================================================
   HTML ESCAPE
   ========================================================= */

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* =========================================================
   SEND PASSWORD RESET EMAIL
   ========================================================= */

const sendPasswordResetEmail = async ({
  email,
  name,
  resetUrl,
}) => {
  try {
    /* =========================================
       VALIDATION
       ========================================= */

    if (!email || !resetUrl) {
      throw new Error(
        "Email and reset URL are required."
      );
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      throw new Error(
        "SMTP configuration is incomplete."
      );
    }

    /* =========================================
       SANITIZE DATA
       ========================================= */

    const safeName = escapeHtml(name || "User");

    /* =========================================
       SEND EMAIL
       ========================================= */

    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,

      to: email,

      subject: "Reset Your MultiStream Password",

      text: `
Hello ${name || "User"},

We received a request to reset your MultiStream password.

Please use the following link to reset your password:

${resetUrl}

This link expires in 30 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
MultiStream Team
      `,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          background: #09090f;
          color: #ffffff;
          padding: 32px;
        ">
          <div style="
            max-width: 480px;
            margin: auto;
            background: #11111b;
            border: 1px solid #272733;
            border-radius: 16px;
            padding: 32px;
          ">

            <h1 style="
              text-align: center;
              color: #ffffff;
              margin-bottom: 24px;
            ">
              MultiStream
            </h1>

            <h2 style="
              color: #ffffff;
            ">
              Reset Your Password
            </h2>

            <p style="
              color: #a1a1aa;
              line-height: 1.7;
            ">
              Hello ${safeName},
            </p>

            <p style="
              color: #a1a1aa;
              line-height: 1.7;
            ">
              We received a request to reset your
              MultiStream account password.
            </p>

            <div style="
              text-align: center;
              margin: 32px 0;
            ">
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  background: #4f46e5;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 14px 28px;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>
            </div>

            <p style="
              color: #a1a1aa;
              line-height: 1.7;
            ">
              This link will expire in 30 minutes.
            </p>

            <p style="
              color: #a1a1aa;
              line-height: 1.7;
            ">
              If you did not request this reset,
              you can safely ignore this email.
            </p>

            <hr style="
              border: none;
              border-top: 1px solid #272733;
              margin: 24px 0;
            " />

            <p style="
              color: #71717a;
              font-size: 12px;
              text-align: center;
            ">
              MultiStream Password Security
            </p>

          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(
      mailOptions
    );

    console.log(
      "Password reset email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Email Service Error:",
      error.message
    );

    throw error;
  }
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  sendPasswordResetEmail,
};
