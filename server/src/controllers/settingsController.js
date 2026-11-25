/* =========================================================
   SETTINGS CONTROLLER
   ========================================================= */

const settingsService = require("../services/settingsService");

/* =========================================================
   GET SETTINGS
   GET /api/settings
   ========================================================= */

const getSettings = (req, res) => {
  try {
    const settings = settingsService.getSettings();

    return res.status(200).json({
      success: true,
      message: "Settings retrieved successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve settings.",
    });
  }
};

/* =========================================================
   UPDATE SETTINGS
   PUT /api/settings
   ========================================================= */

const updateSettings = (req, res) => {
  try {
    const settingsData = req.body;

    if (
      !settingsData ||
      typeof settingsData !== "object" ||
      Array.isArray(settingsData)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid settings data.",
      });
    }

    const updatedSettings =
      settingsService.updateSettings(settingsData);

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Update Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update settings.",
    });
  }
};

/* =========================================================
   RESET SETTINGS
   POST /api/settings/reset
   ========================================================= */

const resetSettings = (req, res) => {
  try {
    const settings = settingsService.resetSettings();

    return res.status(200).json({
      success: true,
      message: "Settings reset successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Reset Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset settings.",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER
   ========================================================= */

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};