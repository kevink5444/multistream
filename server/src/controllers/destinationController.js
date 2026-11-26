/* =========================================================
   DESTINATION CONTROLLER
   ========================================================= */

const destinationService = require("../services/destinationService");
const activityLogService = require("../services/activityLogService");

/* =========================================================
   ACTIVITY LOG HELPER
   ========================================================= */

const createActivityLog = (logData) => {
  try {
    activityLogService.createLog(logData);
  } catch (error) {
    console.error(
      "[Destination Controller] Failed to create activity log:",
      error.message
    );
  }
};

/* =========================================================
   GET ALL DESTINATIONS
   ========================================================= */

const getAllDestinations = (req, res) => {
  try {
    const destinations = destinationService.getAllDestinations();

    res.status(200).json({
      success: true,
      message: "Destinations retrieved successfully",
      data: destinations,
    });
  } catch (error) {
    console.error(
      "[Destination Controller] Get all error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve destinations",
      error: error.message,
    });
  }
};

/* =========================================================
   GET DESTINATION BY ID
   ========================================================= */

const getDestinationById = (req, res) => {
  try {
    const { id } = req.params;

    const destination = destinationService.getDestinationById(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination retrieved successfully",
      data: destination,
    });
  } catch (error) {
    console.error(
      "[Destination Controller] Get by ID error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve destination",
      error: error.message,
    });
  }
};

/* =========================================================
   CREATE DESTINATION
   ========================================================= */

const createDestination = (req, res) => {
  try {
    const {
      name,
      platform,
      status,
      streamKey,
      streamUrl,
    } = req.body;

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!name || !platform) {
      return res.status(400).json({
        success: false,
        message: "Name and platform are required",
      });
    }

    /* =====================================================
       CREATE DESTINATION
       ===================================================== */

    const newDestination = destinationService.createDestination({
      name,
      platform,
      status,
      streamKey,
      streamUrl,
    });

    /* =====================================================
       ACTIVITY LOG
       ===================================================== */

    createActivityLog({
      type: "success",
      category: "destination",
      title: "Destination created",
      description: `${newDestination.name} (${newDestination.platform}) was successfully added.`,
      destination: newDestination.name,
      metadata: {
        destinationId: newDestination.id,
        platform: newDestination.platform,
        status: newDestination.status,
      },
    });

    /* =====================================================
       RESPONSE
       ===================================================== */

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: newDestination,
    });
  } catch (error) {
    console.error(
      "[Destination Controller] Create error:",
      error.message
    );

    /* =====================================================
       ERROR ACTIVITY LOG
       ===================================================== */

    createActivityLog({
      type: "error",
      category: "destination",
      title: "Destination creation failed",
      description: error.message,
      destination: req.body?.name || "Unknown Destination",
      metadata: {
        platform: req.body?.platform || null,
      },
    });

    res.status(500).json({
      success: false,
      message: "Failed to create destination",
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE DESTINATION
   ========================================================= */

const updateDestination = (req, res) => {
  try {
    const { id } = req.params;

    /* =====================================================
       UPDATE DESTINATION
       ===================================================== */

    const updatedDestination =
      destinationService.updateDestination(id, req.body);

    if (!updatedDestination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    /* =====================================================
       ACTIVITY LOG
       ===================================================== */

    createActivityLog({
      type: "info",
      category: "destination",
      title: "Destination updated",
      description: `${updatedDestination.name} (${updatedDestination.platform}) was successfully updated.`,
      destination: updatedDestination.name,
      metadata: {
        destinationId: updatedDestination.id,
        platform: updatedDestination.platform,
        status: updatedDestination.status,
      },
    });

    /* =====================================================
       RESPONSE
       ===================================================== */

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: updatedDestination,
    });
  } catch (error) {
    console.error(
      "[Destination Controller] Update error:",
      error.message
    );

    /* =====================================================
       ERROR ACTIVITY LOG
       ===================================================== */

    createActivityLog({
      type: "error",
      category: "destination",
      title: "Destination update failed",
      description: error.message,
      destination: `Destination ID ${req.params.id}`,
      metadata: {
        destinationId: Number(req.params.id),
      },
    });

    res.status(500).json({
      success: false,
      message: "Failed to update destination",
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE DESTINATION
   ========================================================= */

const deleteDestination = (req, res) => {
  try {
    const { id } = req.params;

    /* =====================================================
       DELETE DESTINATION
       ===================================================== */

    const deletedDestination =
      destinationService.deleteDestination(id);

    if (!deletedDestination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    /* =====================================================
       ACTIVITY LOG
       ===================================================== */

    createActivityLog({
      type: "warning",
      category: "destination",
      title: "Destination deleted",
      description: `${deletedDestination.name} (${deletedDestination.platform}) was removed.`,
      destination: deletedDestination.name,
      metadata: {
        destinationId: deletedDestination.id,
        platform: deletedDestination.platform,
        previousStatus: deletedDestination.status,
      },
    });

    /* =====================================================
       RESPONSE
       ===================================================== */

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
      data: deletedDestination,
    });
  } catch (error) {
    console.error(
      "[Destination Controller] Delete error:",
      error.message
    );

    /* =====================================================
       ERROR ACTIVITY LOG
       ===================================================== */

    createActivityLog({
      type: "error",
      category: "destination",
      title: "Destination deletion failed",
      description: error.message,
      destination: `Destination ID ${req.params.id}`,
      metadata: {
        destinationId: Number(req.params.id),
      },
    });

    res.status(500).json({
      success: false,
      message: "Failed to delete destination",
      error: error.message,
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
};