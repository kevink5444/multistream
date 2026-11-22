/* =========================================================
   CREATE FIRST ADMIN
   ========================================================= */

require("dotenv").config();

const authService = require("../services/authService");

const bcrypt = require("bcryptjs");

/* =========================================================
   MAIN
   ========================================================= */

const createAdmin = async () => {
  const users = authService.getAllUsers();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminName = process.env.ADMIN_NAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (
    !adminEmail ||
    !adminName ||
    !adminPassword
  ) {
    console.error(
      "ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD must be configured in .env"
    );

    process.exit(1);
  }

  const existingAdmin = users.find(
    (user) => user.role === "admin"
  );

  if (existingAdmin) {
    console.log("An admin account already exists.");

    process.exit(0);
  }

  const existingUser = users.find(
    (user) =>
      user.email.toLowerCase() ===
      adminEmail.toLowerCase()
  );

  if (existingUser) {
    console.error(
      "This email is already registered as a user."
    );

    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(
    adminPassword,
    12
  );

  const admin = {
    id: `admin_${Date.now()}`,
    name: adminName,
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: "admin",
    channelLimit: null,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  users.push(admin);

  const fs = require("fs");
  const path = require("path");

  const usersFile = path.join(
    __dirname,
    "../data/users.json"
  );

  fs.writeFileSync(
    usersFile,
    JSON.stringify(users, null, 2)
  );

  console.log("------------------------------------");
  console.log("Admin account created successfully");
  console.log(`Email: ${admin.email}`);
  console.log("Role: admin");
  console.log("Channel Limit: Unlimited");
  console.log("------------------------------------");
};

/* =========================================================
   EXECUTE
   ========================================================= */

createAdmin().catch((error) => {
  console.error("Failed to create admin:", error);

  process.exit(1);
});