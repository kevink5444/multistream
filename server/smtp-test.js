require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testSMTP() {
  try {
    console.log("Testing SMTP connection...");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);

    await transporter.verify();

    console.log("SMTP AUTHENTICATION SUCCESSFUL!");
    console.log("Gmail SMTP is ready.");
  } catch (error) {
    console.error("SMTP AUTHENTICATION FAILED!");
    console.error("Code:", error.code);
    console.error("Response:", error.response);
    console.error("Message:", error.message);
  }
}

testSMTP();