/* =========================================================
   AUTH SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

/* =========================================================
   USERS DATA FILE
   ========================================================= */

const USERS_FILE = path.join(
  __dirname,
  "../data/users.json"
);

/* =========================================================
   ENSURE USERS FILE EXISTS
   ========================================================= */

const ensureUsersFile = () => {
  const directory = path.dirname(USERS_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(
      USERS_FILE,
      JSON.stringify([], null, 2)
    );
  }
};

/* =========================================================
   READ USERS
   ========================================================= */

const getAllUsers = () => {
  ensureUsersFile();

  try {
    const data = fs.readFileSync(
      USERS_FILE,
      "utf8"
    );

    return JSON.parse(data);
  } catch (error) {
    throw new Error(
      "Failed to read user data."
    );
  }
};

/* =========================================================
   SAVE USERS
   ========================================================= */

const saveUsers = (users) => {
  ensureUsersFile();

  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(users, null, 2)
  );
};

/* =========================================================
   FIND USER BY EMAIL
   ========================================================= */

const findUserByEmail = (email) => {
  const users = getAllUsers();

  return users.find(
    (user) =>
      user.email.toLowerCase() ===
      email.toLowerCase()
  );
};

/* =========================================================
   FIND USER BY ID
   ========================================================= */

const findUserById = (id) => {
  const users = getAllUsers();

  return users.find(
    (user) => user.id === id
  );
};

/* =========================================================
   REGISTER USER
   ========================================================= */

const registerUser = async ({
  name,
  email,
  password,
}) => {
  const users = getAllUsers();

  const existingUser = users.find(
    (user) =>
      user.email.toLowerCase() ===
      email.toLowerCase()
  );

  if (existingUser) {
    throw new Error(
      "Email is already registered."
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "user",
    channelLimit: 2,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  saveUsers(users);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    channelLimit: newUser.channelLimit,
    status: newUser.status,
    createdAt: newUser.createdAt,
  };
};

/* =========================================================
   VERIFY PASSWORD
   ========================================================= */

const verifyPassword = async (
  password,
  passwordHash
) => {
  return bcrypt.compare(
    password,
    passwordHash
  );
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  registerUser,
  verifyPassword,
};