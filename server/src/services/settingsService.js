/* =========================================================
   SETTINGS SERVICE
   ========================================================= */

const fs = require("fs");
const path = require("path");

/* =========================================================
   DATA STORAGE
   ========================================================= */

const dataPath = path.join(__dirname, "../data/settings.json");

/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

const defaultSettings = {
  applicationName: "MultiStream",

  startup: false,
  minimizeToTray: true,
  notifications: true,
  theme: "dark",

  resolution: "1920x1080",
  fps: "60",
  videoEncoder: "H.264",
  bitrate: "6000",
  keyframeInterval: "2",
  preset: "medium",

  audioEncoder: "AAC",
  audioBitrate: "160",
  sampleRate: "48000",
  channels: "Stereo",

  hardwareAcceleration: false,
  lowLatency: false,
  autoReconnect: true,
  reconnectAttempts: "5",
};

/* =========================================================
   READ SETTINGS
   ========================================================= */

const readSettings = () => {
  if (!fs.existsSync(dataPath)) {
    saveSettings(defaultSettings);
  }

  const data = fs.readFileSync(dataPath, "utf8");

  const savedSettings = JSON.parse(data);

  return {
    ...defaultSettings,
    ...savedSettings,
  };
};

/* =========================================================
   SAVE SETTINGS
   ========================================================= */

const saveSettings = (settings) => {
  fs.writeFileSync(
    dataPath,
    JSON.stringify(settings, null, 2),
    "utf8"
  );
};

/* =========================================================
   GET SETTINGS
   ========================================================= */

const getSettings = () => {
  return readSettings();
};

/* =========================================================
   UPDATE SETTINGS
   ========================================================= */

const updateSettings = (data) => {
  const currentSettings = readSettings();

  const updatedSettings = {
    ...currentSettings,
    ...data,
  };

  saveSettings(updatedSettings);

  return updatedSettings;
};

/* =========================================================
   RESET SETTINGS
   ========================================================= */

const resetSettings = () => {
  saveSettings(defaultSettings);

  return defaultSettings;
};

/* =========================================================
   EXPORT SERVICE
   ========================================================= */

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};