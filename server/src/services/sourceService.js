/* =========================================================
   SOURCE SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* =========================================================
   DATA STORAGE
   ========================================================= */

const dataDirectory = path.join(__dirname, "../data");
const dataPath = path.join(dataDirectory, "sources.json");

/* =========================================================
   STREAM KEY GENERATOR
   ========================================================= */

/**
 * Generate unique MultiStream incoming RTMP Stream Key.
 *
 * Format:
 * ms_live_<random_hex>
 */
const generateStreamKey = () => {
  return `ms_live_${crypto.randomBytes(32).toString("hex")}`;
};

/**
 * Ensure generated Stream Key is unique.
 */
const generateUniqueStreamKey = (sources) => {
  let streamKey;

  do {
    streamKey = generateStreamKey();
  } while (
    sources.some(
      (source) =>
        source.settings?.inputStreamKey === streamKey
    )
  );

  return streamKey;
};

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

    if (!Array.isArray(sources)) {
      return [];
    }

    /*
     * =====================================================
     * MIGRATION
     * =====================================================
     *
     * Existing RTMP Sources that do not have an incoming
     * Stream Key will automatically receive one.
     *
     * This migration is backward compatible.
     */

    let migrationRequired = false;

    sources.forEach((source) => {
      if (
        String(source.type).toLowerCase() !== "rtmp"
      ) {
        return;
      }

      if (!source.settings) {
        source.settings = {};
        migrationRequired = true;
      }

      if (!source.settings.inputStreamKey) {
        source.settings.inputStreamKey =
          generateUniqueStreamKey(sources);

        migrationRequired = true;
      }
    });

    /*
     * Save migrated Sources only when necessary.
     */

    if (migrationRequired) {
      saveSources(sources);

      console.log(
        "[Source Service] RTMP Stream Key migration completed."
      );
    }

    return sources;
  } catch (error) {
    console.error(
      "[Source Service] Read error:",
      error.message
    );

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
    (source) =>
      String(source.userId) === String(userId)
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
   GET SOURCE BY INPUT STREAM KEY
   ========================================================= */

/**
 * Internal RTMP lookup.
 *
 * This function is used by the RTMP server to identify
 * incoming stream ownership.
 *
 * It does not require Express session because RTMP
 * connections are outside the HTTP session context.
 *
 * Security:
 * - Only RTMP Sources are searched.
 * - Stream Key must match exactly.
 * - Source ownership is returned with the Source.
 */

const getSourceByStreamKey = (streamKey) => {
  if (
    !streamKey ||
    typeof streamKey !== "string"
  ) {
    return null;
  }

  const sources = readSources();

  const source = sources.find((item) => {
    return (
      String(item.type).toLowerCase() === "rtmp" &&
      item.settings?.inputStreamKey === streamKey
    );
  });

  return source || null;
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

  const settings = {
    ...(data.settings || {}),
  };

  /*
   * =====================================================
   * GENERATE INPUT STREAM KEY
   * =====================================================
   *
   * Stream Key is generated by backend.
   * Client cannot provide its own key.
   */

  if (
    String(data.type).toLowerCase() === "rtmp"
  ) {
    settings.inputStreamKey =
      generateUniqueStreamKey(sources);
  }

  const newSource = {
    id: Date.now().toString(),

    userId: String(userId),

    name: data.name,
    type: data.type,

    status: "inactive",
    wasActive: false,

    settings,

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

  /*
   * =====================================================
   * MERGE SETTINGS
   * =====================================================
   *
   * Existing settings are preserved.
   *
   * Important:
   * inputStreamKey cannot be changed directly by frontend.
   */

  let updatedSettings = {
    ...(existingSource.settings || {}),
    ...(data.settings || {}),
  };

  /*
   * Preserve the existing Stream Key.
   */

  const existingStreamKey =
    existingSource.settings?.inputStreamKey;

  if (existingStreamKey) {
    updatedSettings.inputStreamKey =
      existingStreamKey;
  }

  /*
   * If Source is changed to RTMP and does not yet have
   * a Stream Key, generate a new one.
   */

  if (
    String(
      updatedData.type ?? existingSource.type
    ).toLowerCase() === "rtmp"
  ) {
    if (!updatedSettings.inputStreamKey) {
      updatedSettings.inputStreamKey =
        generateUniqueStreamKey(sources);
    }
  }

  const updatedSource = {
    ...existingSource,
    ...updatedData,

    settings: updatedSettings,

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
  getSourceByStreamKey,
  createSource,
  updateSource,
  deleteSource,
};