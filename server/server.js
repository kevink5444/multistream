
require("dotenv").config();

const app = require("./src/app");
const { startRTMPServer } = require("./src/services/rtmpServer");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("------------------------------------");
    console.log("MultiStream Backend Started");
    console.log(`API Server: http://localhost:${PORT}`);
    console.log("------------------------------------");

    startRTMPServer();
});
