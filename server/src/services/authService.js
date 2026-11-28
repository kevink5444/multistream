
/* =========================================================
   AUTH SERVICE
   ========================================================= */

const crypto = require("crypto");
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
      JSON.stringify([], null, 2),
      "utf8"
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

    const users = JSON.parse(data);

    if (!Array.isArray(users)) {
      throw new Error("Invalid users data.");
    }

    return users;
  } catch (error) {
    console.error("Read Users Error:", error);

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

  const temporaryFile = `${USERS_FILE}.tmp`;

  try {
    fs.writeFileSync(
      temporaryFile,
      JSON.stringify(users, null, 2),
      "utf8"
    );

    fs.renameSync(
      temporaryFile,
      USERS_FILE
    );
  } catch (error) {
    if (fs.existsSync(temporaryFile)) {
      fs.unlinkSync(temporaryFile);
    }

    console.error("Save Users Error:", error);

    throw new Error(
      "Failed to save user data."
    );
  }
};

/* =========================================================
   FIND USER BY EMAIL
   ========================================================= */

const findUserByEmail = (email) => {
  if (!email || typeof email !== "string") {
    return undefined;
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const users = getAllUsers();

  return users.find(
    (user) =>
      user.email.toLowerCase() ===
      normalizedEmail
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
   UPDATE USER PROFILE
   ========================================================= */

const updateUserProfile = ({
  id,
  name,
}) => {
  if (!id) {
    throw new Error("User ID is required.");
  }

  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    throw new Error("Name is required.");
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    throw new Error(
      "Name must be at least 2 characters."
    );
  }

  if (trimmedName.length > 50) {
    throw new Error(
      "Name cannot exceed 50 characters."
    );
  }

  const users = getAllUsers();

  const userIndex = users.findIndex(
    (user) => user.id === id
  );

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  users[userIndex] = {
    ...users[userIndex],
    name: trimmedName,
    updatedAt: new Date().toISOString(),
  };

  saveUsers(users);

  const updatedUser = users[userIndex];

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    channelLimit: updatedUser.channelLimit,
    status: updatedUser.status,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
};

/* =========================================================
   UPDATE USER CHANNEL LIMIT
   ========================================================= */

const updateUserChannelLimit = (
  userId,
  channelLimit
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  const normalizedChannelLimit = Number(
    channelLimit
  );

  if (
    !Number.isInteger(
      normalizedChannelLimit
    )
  ) {
    throw new Error(
      "Channel limit must be a whole number."
    );
  }

  if (
    normalizedChannelLimit < 1 ||
    normalizedChannelLimit > 100
  ) {
    throw new Error(
      "Channel limit must be between 1 and 100."
    );
  }

  const users = getAllUsers();

  const userIndex = users.findIndex(
    (user) => user.id === userId
  );

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  const user = users[userIndex];

  if (user.role === "admin") {
    throw new Error(
      "Administrator channel limit cannot be modified."
    );
  }

  users[userIndex] = {
    ...user,

    channelLimit:
      normalizedChannelLimit,

    updatedAt: new Date().toISOString(),
  };

  saveUsers(users);

  const updatedUser = users[userIndex];

  /*
   * Return safe user data.
   * Never expose passwordHash or reset tokens.
   */
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    channelLimit: updatedUser.channelLimit,
    status: updatedUser.status,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  };
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

  const normalizedEmail =
    email.trim().toLowerCase();

  const existingUser = users.find(
    (user) =>
      user.email.toLowerCase() ===
      normalizedEmail
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
    email: normalizedEmail,
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
   CREATE PASSWORD RESET TOKEN
   ========================================================= */

const createPasswordResetToken = (email) => {
  const normalizedEmail =
    email.trim().toLowerCase();

  const users = getAllUsers();

  const userIndex = users.findIndex(
    (user) =>
      user.email.toLowerCase() ===
      normalizedEmail
  );

  if (userIndex === -1) {
    return null;
  }

  const user = users[userIndex];

  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expiresAt =
    Date.now() + 30 * 60 * 1000;

  users[userIndex] = {
    ...user,
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: expiresAt,
  };

  saveUsers(users);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    resetToken,
  };
};

/* =========================================================
   RESET PASSWORD
   ========================================================= */

const resetPassword = async ({
  token,
  password,
}) => {
  if (
    typeof token !== "string" ||
    !token.trim()
  ) {
    throw new Error(
      "Invalid or expired reset link."
    );
  }

  const users = getAllUsers();

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const userIndex = users.findIndex(
    (user) =>
      user.resetPasswordToken === tokenHash
  );

  if (userIndex === -1) {
    throw new Error(
      "Invalid or expired reset link."
    );
  }

  const user = users[userIndex];

  if (
    !user.resetPasswordExpires ||
    user.resetPasswordExpires <= Date.now()
  ) {
    throw new Error(
      "Invalid or expired reset link."
    );
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const {
    resetPasswordToken,
    resetPasswordExpires,
    ...userWithoutResetToken
  } = user;

  users[userIndex] = {
    ...userWithoutResetToken,
    passwordHash,
  };

  saveUsers(users);

  return true;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  registerUser,
  updateUserProfile,
  updateUserChannelLimit,
  verifyPassword,
  createPasswordResetToken,
  resetPassword,
};
