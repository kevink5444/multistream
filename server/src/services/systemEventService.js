/* =========================================================
   MULTISTREAM SYSTEM EVENT SERVICE
   ========================================================= */

const activityLogService = require("./activityLogService");
const notificationService = require("./notificationService");

/* =========================================================
   EMIT SYSTEM EVENT
   ========================================================= */

const emitSystemEvent = ({
  type = "info",
  category = "system",
  title,
  description = "",
  metadata = {},
  notification = true,
}) => {
  /* =======================================================
     ACTIVITY LOG
     ======================================================= */

  const log = activityLogService.createLog({
    type,
    category,
    title,
    description,
    destination: "System",
    metadata,
  });

  /* =======================================================
     NOTIFICATION
     ======================================================= */

  let notificationData = null;

  if (notification) {
    notificationData = notificationService.createNotification({
      type,
      category,
      title,
      description,
      metadata,
    });
  }

  return {
    log,
    notification: notificationData,
  };
};

/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {
  emitSystemEvent,
};