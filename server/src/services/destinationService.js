
/* =========================================================
   DESTINATION SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

/* =========================================================
   DATA STORAGE
   ========================================================= */

const dataPath = path.join(__dirname, "../data/destinations.json");

/* =========================================================
   READ DESTINATIONS
   ========================================================= */

const readDestinations = () => {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2), "utf8");
  }

  const data = fs.readFileSync(dataPath, "utf8");
  const destinations = JSON.parse(data);

  if (!Array.isArray(destinations)) {
    throw new Error("Invalid destination data.");
  }

  return destinations;
};

/* =========================================================
   SAVE DESTINATIONS
   ========================================================= */

const saveDestinations = (destinations) => {
  fs.writeFileSync(
    dataPath,
    JSON.stringify(destinations, null, 2),
    "utf8"
  );
};

/* =========================================================
   USER ACCESS HELPER
   ========================================================= */

const isAdmin = (user) => {
  return user?.role === "admin";
};

const getUserId = (user) => {
  return user?.id ?? user?._id ?? null;
};

/* =========================================================
   GET ALL DESTINATIONS
   ========================================================= */

const getAllDestinations = (user) => {
  const destinations = readDestinations();

  // Admin dapat melihat semua destination
  if (isAdmin(user)) {
    return destinations;
  }

  const userId = getUserId(user);

  if (!userId) {
    throw new Error("Authentication required.");
  }

  // User hanya dapat melihat destination miliknya
  return destinations.filter(
    (destination) =>
      String(destination.userId) === String(userId)
  );
};

/* =========================================================
   GET DESTINATION BY ID
   ========================================================= */

const getDestinationById = (id, user) => {
  const destinations = readDestinations();

  const destination = destinations.find(
    (item) => item.id === Number(id)
  );

  if (!destination) {
    return null;
  }

  // Admin dapat mengakses semua destination
  if (isAdmin(user)) {
    return destination;
  }

  const userId = getUserId(user);

  // User hanya boleh mengakses destination miliknya
  if (
    !userId ||
    String(destination.userId) !== String(userId)
  ) {
    return null;
  }

  return destination;
};

/* =========================================================
   CREATE DESTINATION
   ========================================================= */

const createDestination = (data, user) => {
  const destinations = readDestinations();

  const userId = getUserId(user);

  if (!userId) {
    throw new Error("Authentication required.");
  }

  const newDestination = {
    id:
      destinations.length > 0
        ? Math.max(
            ...destinations.map((destination) =>
              Number(destination.id) || 0
            )
          ) + 1
        : 1,

    // Ownership berasal dari session backend
    userId,

    name: data.name,
    platform: data.platform,
    status: data.status || "pending",
    streamKey: data.streamKey || "",
    streamUrl: data.streamUrl || "",

    createdAt: new Date().toISOString(),
  };

  destinations.push(newDestination);

  saveDestinations(destinations);

  return newDestination;
};

/* =========================================================
   UPDATE DESTINATION
   ========================================================= */

const updateDestination = (id, data, user) => {
  const destinations = readDestinations();

  const destinationIndex = destinations.findIndex(
    (destination) => destination.id === Number(id)
  );

  if (destinationIndex === -1) {
    return null;
  }

  const existingDestination =
    destinations[destinationIndex];

  // User tidak boleh mengubah destination milik orang lain
  if (!isAdmin(user)) {
    const userId = getUserId(user);

    if (
      !userId ||
      String(existingDestination.userId) !== String(userId)
    ) {
      return null;
    }
  }

  // Hanya field yang diperbolehkan
  const allowedFields = [
    "name",
    "platform",
    "status",
    "streamKey",
    "streamUrl",
  ];

  const sanitizedData = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      sanitizedData[field] = data[field];
    }
  });

  destinations[destinationIndex] = {
    ...existingDestination,
    ...sanitizedData,

    // ID dan owner tidak boleh diubah melalui request
    id: existingDestination.id,
    userId: existingDestination.userId,
  };

  saveDestinations(destinations);

  return destinations[destinationIndex];
};

/* =========================================================
   DELETE DESTINATION
   ========================================================= */

const deleteDestination = (id, user) => {
  const destinations = readDestinations();

  const destinationIndex = destinations.findIndex(
    (destination) => destination.id === Number(id)
  );

  if (destinationIndex === -1) {
    return null;
  }

  const destination =
    destinations[destinationIndex];

  // User tidak boleh menghapus destination milik orang lain
  if (!isAdmin(user)) {
    const userId = getUserId(user);

    if (
      !userId ||
      String(destination.userId) !== String(userId)
    ) {
      return null;
    }
  }

  const deletedDestination = destination;

  destinations.splice(destinationIndex, 1);

  saveDestinations(destinations);

  return deletedDestination;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
};
