/* =========================================================
   SOURCE CONTROLLER
   ========================================================= */

const sourceService = require("../services/sourceService");

/* =========================================================
   GET ALL SOURCES
   GET /api/sources
   ========================================================= */

const getAllSources = (req, res) => {
  try {
    const user = req.session.user;

    const sources = sourceService.getAllSources(user);

    res.status(200).json({
      success: true,
      total: sources.length,
      data: sources,
    });
  } catch (error) {
    console.error(
      "[Source Controller] Get all error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve sources",
    });
  }
};

/* =========================================================
   GET SOURCE BY ID
   GET /api/sources/:id
   ========================================================= */

const getSourceById = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;

    const source = sourceService.getSourceById(id, user);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    res.status(200).json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error(
      "[Source Controller] Get by ID error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve source",
    });
  }
};

/* =========================================================
   CREATE SOURCE
   POST /api/sources
   ========================================================= */

const createSource = (req, res) => {
  try {
    const user = req.session.user;

    const {
      name,
      type,
      settings,
    } = req.body;

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Source name is required",
      });
    }

    if (
      !type ||
      typeof type !== "string" ||
      !type.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Source type is required",
      });
    }

    if (
      settings !== undefined &&
      (
        typeof settings !== "object" ||
        settings === null ||
        Array.isArray(settings)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid source settings",
      });
    }

    /* =====================================================
       CREATE SOURCE
       ===================================================== */

    const newSource = sourceService.createSource(
      {
        name: name.trim(),
        type: type.trim(),
        settings: settings || {},
      },
      user
    );

    /* =====================================================
       RESPONSE
       ===================================================== */

    res.status(201).json({
      success: true,
      message: "Source created successfully",
      data: newSource,
    });
  } catch (error) {
    console.error(
      "[Source Controller] Create error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to create source",
    });
  }
};

/* =========================================================
   UPDATE SOURCE
   PUT /api/sources/:id
   ========================================================= */

const updateSource = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;

    const {
      name,
      type,
      settings,
    } = req.body;

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (
      name !== undefined &&
      (
        typeof name !== "string" ||
        !name.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid source name",
      });
    }

    if (
      type !== undefined &&
      (
        typeof type !== "string" ||
        !type.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid source type",
      });
    }

    if (
      settings !== undefined &&
      (
        typeof settings !== "object" ||
        settings === null ||
        Array.isArray(settings)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid source settings",
      });
    }

    /* =====================================================
       UPDATE SOURCE
       ===================================================== */

    const updatedSource = sourceService.updateSource(
      id,
      {
        name:
          name !== undefined
            ? name.trim()
            : undefined,

        type:
          type !== undefined
            ? type.trim()
            : undefined,

        settings,
      },
      user
    );

    if (!updatedSource) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    /* =====================================================
       RESPONSE
       ===================================================== */

    res.status(200).json({
      success: true,
      message: "Source updated successfully",
      data: updatedSource,
    });
  } catch (error) {
    console.error(
      "[Source Controller] Update error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update source",
    });
  }
};

/* =========================================================
   DELETE SOURCE
   DELETE /api/sources/:id
   ========================================================= */

const deleteSource = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.session.user;

    const deleted = sourceService.deleteSource(
      id,
      user
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Source not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Source deleted successfully",
    });
  } catch (error) {
    console.error(
      "[Source Controller] Delete error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete source",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
};