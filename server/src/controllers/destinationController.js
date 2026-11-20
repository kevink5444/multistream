/* =========================================================
   DESTINATION CONTROLLER
   ========================================================= */

const destinationService = require("../services/destinationService");

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

    /* Validation */

    if (!name || !platform) {
      return res.status(400).json({
        success: false,
        message: "Name and platform are required",
      });
    }

    const newDestination = destinationService.createDestination({
      name,
      platform,
      status,
      streamKey,
      streamUrl,
    });

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: newDestination,
    });
  } catch (error) {
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

    const updatedDestination =
      destinationService.updateDestination(id, req.body);

    if (!updatedDestination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: updatedDestination,
    });
  } catch (error) {
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

    const deletedDestination =
      destinationService.deleteDestination(id);

    if (!deletedDestination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
      data: deletedDestination,
    });
  } catch (error) {
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