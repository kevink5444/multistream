const {
  getForwarderStatuses,
  getActiveForwarders,
} = require("../services/streamForwarder");

function getAllForwarderStatuses(req, res) {
  try {
    const statuses = getForwarderStatuses();
    const activeForwarders = getActiveForwarders();

    // Filter data agar informasi sensitif tidak dikirim ke frontend
    const safeStatuses = statuses.map((forwarder) => ({
      streamId: forwarder.streamId,
      destinationId: forwarder.destinationId,
      platform: forwarder.platform,
      destinationName: forwarder.destinationName,

      status: forwarder.status,

      startedAt: forwarder.startedAt,
      connectedAt: forwarder.connectedAt,
      stoppedAt: forwarder.stoppedAt,
      updatedAt: forwarder.updatedAt,

      lastError: forwarder.lastError,
      exitCode: forwarder.exitCode,
      signal: forwarder.signal,
    }));

    res.json({
      success: true,
      total: safeStatuses.length,
      active: activeForwarders.length,
      data: safeStatuses,
    });
  } catch (error) {
    console.error("[Forwarder Controller] Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve forwarder statuses",
    });
  }
}

module.exports = {
  getAllForwarderStatuses,
};