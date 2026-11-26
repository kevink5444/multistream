require("dotenv").config();

const app = require("./src/app");

const { startRTMPServer } = require("./src/services/rtmpServer");

const systemMonitorService = require("./src/services/systemMonitorService");

const PORT = process.env.PORT || 5000;

/* =========================================================
   START BACKEND
   ========================================================= */

app.listen(PORT, () => {
  console.log("------------------------------------");
  console.log("MultiStream Backend Started");
  console.log(`API Server: http://localhost:${PORT}`);
  console.log("------------------------------------");

  /* =======================================================
     SYSTEM MONITOR
     ======================================================= */

  systemMonitorService.initializeSystemMonitor();

  /* =======================================================
     START RTMP SERVER
     ======================================================= */

  startRTMPServer();
});