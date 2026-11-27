/* =========================================================
   SOURCE SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

/* =========================================================
   DATA STORAGE
   ========================================================= */

const dataDirectory = path.join(__dirname, "../data");
const dataPath = path.join(dataDirectory, "sources.json");

/* =========================================================
   INITIALIZE STORAGE
   ========================================================= */

const initializeStorage = () => {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(
      dataPath,
      JSON.stringify([], null, 2),
      "utf8"
    );
  }
};

/* =========================================================
   READ SOURCES
   ========================================================= */

const readSources = () => {
  initializeStorage();

  try {
    const data = fs.readFileSync(dataPath, "utf8");
    const sources = JSON.parse(data);

    return Array.isArray(sources) ? sources : [];
  } catch (error) {
    console.error("[Source Service] Read error:", error.message);
    return [];
  }
};

/* =========================================================
   SAVE SOURCES
   ========================================================= */

const saveSources = (sources) => {
  initializeStorage();

  fs.writeFileSync(
    dataPath,
    JSON.stringify(sources, null, 2),
    "utf8"
  );
};

/* =========================================================
   GET SOURCES BY USER
   ========================================================= */

const getAllSources = (user) => {
  const sources = readSources();

  // Admin dapat melihat seluruh Sources
  if (user?.role === "admin") {
    return sources;
  }

  const userId = user?.id ?? user?._id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  // User hanya melihat Sources miliknya
  return sources.filter(
    (source) => String(source.userId) === String(userId)
  );
};

/* =========================================================
   GET SOURCE BY ID
   ========================================================= */

const getSourceById = (id, user) => {
  const sources = readSources();

  const source = sources.find(
    (item) => String(item.id) === String(id)
  );

  if (!source) {
    return null;
  }

  // Admin dapat mengakses semua Source
  if (user?.role === "admin") {
    return source;
  }

  const userId = user?.id ?? user?._id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  // Ownership validation
  if (String(source.userId) !== String(userId)) {
    return null;
  }

  return source;
};

/* =========================================================
   CREATE SOURCE
   ========================================================= */

const createSource = (data, user) => {
  const sources = readSources();

  const userId = user?.id ?? user?._id;

  if (!userId) {
    throw new Error("Authentication required");
  }

  const newSource = {
    id: Date.now().toString(),

    userId: String(userId),

    name: data.name,
    type: data.type,

    status: "inactive",
    wasActive: false,

    settings: data.settings || {},

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  sources.unshift(newSource);

  saveSources(sources);

  console.log(
    `[Source Service] Source created: ${newSource.name}`
  );

  return newSource;
};

/* =========================================================
   UPDATE SOURCE
   ========================================================= */

const updateSource = (id, data, user) => {
  const sources = readSources();

  const index = sources.findIndex(
    (source) => String(source.id) === String(id)
  );

  if (index === -1) {
    return null;
  }

  const existingSource = sources[index];

  // User tidak boleh mengubah Source milik user lain
  if (user?.role !== "admin") {
    const userId = user?.id ?? user?._id;

    if (
      !userId ||
      String(existingSource.userId) !== String(userId)
    ) {
      return null;
    }
  }

  const allowedFields = [
    "name",
    "type",
    "settings",
  ];

  const updatedData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updatedData[field] = data[field];
    }
  });

  const updatedSource = {
    ...existingSource,
    ...updatedData,

    // Ownership tidak boleh diubah melalui request
    userId: existingSource.userId,

    updatedAt: new Date().toISOString(),
  };

  sources[index] = updatedSource;

  saveSources(sources);

  console.log(
    `[Source Service] Source updated: ${updatedSource.name}`
  );

  return updatedSource;
};

/* =========================================================
   DELETE SOURCE
   ========================================================= */

const deleteSource = (id, user) => {
  const sources = readSources();

  const index = sources.findIndex(
    (source) => String(source.id) === String(id)
  );

  if (index === -1) {
    return false;
  }

  const source = sources[index];

  // User tidak boleh menghapus Source milik user lain
  if (user?.role !== "admin") {
    const userId = user?.id ?? user?._id;

    if (
      !userId ||
      String(source.userId) !== String(userId)
    ) {
      return false;
    }
  }

  sources.splice(index, 1);

  saveSources(sources);

  console.log(
    `[Source Service] Source deleted: ${source.name}`
  );

  return true;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
};