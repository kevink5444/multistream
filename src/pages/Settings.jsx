
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Monitor,
  Video,
  AudioLines,
  Gauge,
  Save,
  RotateCcw,
  Check,
  Info,
} from "lucide-react";

// ======================================================
// DEFAULT SETTINGS
// ======================================================

const defaultSettings = {
  // General
  applicationName: "MultiStream",
  startup: false,
  minimizeToTray: true,
  notifications: true,
  theme: "dark",

  // Video
  resolution: "1920x1080",
  fps: "60",
  videoEncoder: "H.264",
  bitrate: "6000",
  keyframeInterval: "2",
  preset: "medium",

  // Audio
  audioEncoder: "AAC",
  audioBitrate: "160",
  sampleRate: "48000",
  channels: "Stereo",

  // Performance
  hardwareAcceleration: false,
  lowLatency: false,
  autoReconnect: true,
  reconnectAttempts: "5",
};

// ======================================================
// SECTION HEADER
// ======================================================

function SectionHeader({ title, description }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

// ======================================================
// SETTINGS CARD
// ======================================================

function SettingsCard({ children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] p-5 sm:p-6">
      {children}
    </div>
  );
}

// ======================================================
// INPUT FIELD
// ======================================================

function InputField({
  label,
  description,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>

      {description && (
        <p className="mb-2 text-xs text-zinc-500">
          {description}
        </p>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
      />
    </div>
  );
}

// ======================================================
// SELECT FIELD
// ======================================================

function SelectField({
  label,
  description,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>

      {description && (
        <p className="mb-2 text-xs text-zinc-500">
          {description}
        </p>
      )}

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-[#1a1a22] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ======================================================
// TOGGLE
// ======================================================

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">

      <div className="min-w-0">
        <p className="text-sm font-medium text-white">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-indigo-500"
            : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

    </div>
  );
}

// ======================================================
// SETTINGS PAGE
// ======================================================

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);

  const [activeTab, setActiveTab] = useState("general");

  const [saved, setSaved] = useState(false);

  // ====================================================
  // UPDATE SETTINGS
  // ====================================================

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  // ====================================================
  // SAVE SETTINGS
  // ====================================================

  const saveSettings = () => {
    // Frontend simulation
    localStorage.setItem(
      "multistream-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  // ====================================================
  // RESET SETTINGS
  // ====================================================

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset all settings to their default values?"
    );

    if (!confirmed) return;

    setSettings(defaultSettings);

    localStorage.removeItem("multistream-settings");

    setSaved(false);
  };

  // ====================================================
  // TABS
  // ====================================================

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: SettingsIcon,
    },
    {
      id: "video",
      label: "Video",
      icon: Video,
    },
    {
      id: "audio",
      label: "Audio",
      icon: AudioLines,
    },
    {
      id: "performance",
      label: "Performance",
      icon: Gauge,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Settings
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Configure application preferences and streaming options.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={resetSettings}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111118] px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            onClick={saveSettings}
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            {saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saved ? "Saved" : "Save Changes"}
          </button>

        </div>

      </div>

      {/* ================================================== */}
      {/* SETTINGS NAVIGATION */}
      {/* ================================================== */}

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#111118] p-2">

        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-indigo-500 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />

              {tab.label}
            </button>
          );
        })}

      </div>

      {/* ================================================== */}
      {/* GENERAL SETTINGS */}
      {/* ================================================== */}

      {activeTab === "general" && (
        <div className="space-y-5">

          <SettingsCard>
            <SectionHeader
              title="Application"
              description="Customize general application behavior."
            />

            <div className="space-y-5">

              <InputField
                label="Application Name"
                value={settings.applicationName}
                onChange={(e) =>
                  updateSetting(
                    "applicationName",
                    e.target.value
                  )
                }
              />

              <SelectField
                label="Appearance"
                value={settings.theme}
                onChange={(e) =>
                  updateSetting(
                    "theme",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "dark",
                    label: "Dark",
                  },
                  {
                    value: "light",
                    label: "Light",
                  },
                  {
                    value: "system",
                    label: "System Default",
                  },
                ]}
              />

            </div>
          </SettingsCard>

          <SettingsCard>
            <SectionHeader
              title="Startup & Behavior"
              description="Configure how MultiStream behaves."
            />

            <div className="divide-y divide-white/5">

              <ToggleSetting
                label="Launch at Startup"
                description="Automatically start MultiStream when your computer starts."
                checked={settings.startup}
                onChange={(value) =>
                  updateSetting("startup", value)
                }
              />

              <ToggleSetting
                label="Minimize to Tray"
                description="Keep the application running in the system tray when minimized."
                checked={settings.minimizeToTray}
                onChange={(value) =>
                  updateSetting("minimizeToTray", value)
                }
              />

              <ToggleSetting
                label="Notifications"
                description="Show notifications when streaming events occur."
                checked={settings.notifications}
                onChange={(value) =>
                  updateSetting("notifications", value)
                }
              />

            </div>
          </SettingsCard>

        </div>
      )}

      {/* ================================================== */}
      {/* VIDEO SETTINGS */}
      {/* ================================================== */}

      {activeTab === "video" && (
        <div className="space-y-5">

          <SettingsCard>
            <SectionHeader
              title="Video Output"
              description="Configure video resolution and frame rate."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <SelectField
                label="Resolution"
                value={settings.resolution}
                onChange={(e) =>
                  updateSetting(
                    "resolution",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "3840x2160",
                    label: "3840 × 2160 (4K)",
                  },
                  {
                    value: "2560x1440",
                    label: "2560 × 1440 (1440p)",
                  },
                  {
                    value: "1920x1080",
                    label: "1920 × 1080 (1080p)",
                  },
                  {
                    value: "1280x720",
                    label: "1280 × 720 (720p)",
                  },
                  {
                    value: "854x480",
                    label: "854 × 480 (480p)",
                  },
                ]}
              />

              <SelectField
                label="Frame Rate"
                value={settings.fps}
                onChange={(e) =>
                  updateSetting(
                    "fps",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "24",
                    label: "24 FPS",
                  },
                  {
                    value: "30",
                    label: "30 FPS",
                  },
                  {
                    value: "50",
                    label: "50 FPS",
                  },
                  {
                    value: "60",
                    label: "60 FPS",
                  },
                ]}
              />

              <SelectField
                label="Video Encoder"
                value={settings.videoEncoder}
                onChange={(e) =>
                  updateSetting(
                    "videoEncoder",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "H.264",
                    label: "H.264",
                  },
                  {
                    value: "H.265",
                    label: "H.265 / HEVC",
                  },
                  {
                    value: "AV1",
                    label: "AV1",
                  },
                ]}
              />

              <SelectField
                label="Encoder Preset"
                value={settings.preset}
                onChange={(e) =>
                  updateSetting(
                    "preset",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "ultrafast",
                    label: "Ultrafast",
                  },
                  {
                    value: "fast",
                    label: "Fast",
                  },
                  {
                    value: "medium",
                    label: "Medium",
                  },
                  {
                    value: "slow",
                    label: "Slow",
                  },
                ]}
              />

            </div>
          </SettingsCard>

          <SettingsCard>
            <SectionHeader
              title="Encoding"
              description="Configure video encoding parameters."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <InputField
                label="Bitrate (Kbps)"
                description="Target video bitrate."
                type="number"
                value={settings.bitrate}
                onChange={(e) =>
                  updateSetting(
                    "bitrate",
                    e.target.value
                  )
                }
              />

              <InputField
                label="Keyframe Interval"
                description="Keyframe interval in seconds."
                type="number"
                value={settings.keyframeInterval}
                onChange={(e) =>
                  updateSetting(
                    "keyframeInterval",
                    e.target.value
                  )
                }
              />

            </div>

          </SettingsCard>

        </div>
      )}

      {/* ================================================== */}
      {/* AUDIO SETTINGS */}
      {/* ================================================== */}

      {activeTab === "audio" && (
        <div className="space-y-5">

          <SettingsCard>
            <SectionHeader
              title="Audio Output"
              description="Configure audio encoding and output."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <SelectField
                label="Audio Encoder"
                value={settings.audioEncoder}
                onChange={(e) =>
                  updateSetting(
                    "audioEncoder",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "AAC",
                    label: "AAC",
                  },
                  {
                    value: "MP3",
                    label: "MP3",
                  },
                  {
                    value: "Opus",
                    label: "Opus",
                  },
                ]}
              />

              <SelectField
                label="Audio Bitrate"
                value={settings.audioBitrate}
                onChange={(e) =>
                  updateSetting(
                    "audioBitrate",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "96",
                    label: "96 Kbps",
                  },
                  {
                    value: "128",
                    label: "128 Kbps",
                  },
                  {
                    value: "160",
                    label: "160 Kbps",
                  },
                  {
                    value: "192",
                    label: "192 Kbps",
                  },
                  {
                    value: "256",
                    label: "256 Kbps",
                  },
                  {
                    value: "320",
                    label: "320 Kbps",
                  },
                ]}
              />

              <SelectField
                label="Sample Rate"
                value={settings.sampleRate}
                onChange={(e) =>
                  updateSetting(
                    "sampleRate",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "44100",
                    label: "44.1 kHz",
                  },
                  {
                    value: "48000",
                    label: "48 kHz",
                  },
                  {
                    value: "96000",
                    label: "96 kHz",
                  },
                ]}
              />

              <SelectField
                label="Audio Channels"
                value={settings.channels}
                onChange={(e) =>
                  updateSetting(
                    "channels",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "Mono",
                    label: "Mono",
                  },
                  {
                    value: "Stereo",
                    label: "Stereo",
                  },
                ]}
              />

            </div>
          </SettingsCard>

        </div>
      )}

      {/* ================================================== */}
      {/* PERFORMANCE SETTINGS */}
      {/* ================================================== */}

      {activeTab === "performance" && (
        <div className="space-y-5">

          <SettingsCard>
            <SectionHeader
              title="Performance Optimization"
              description="Adjust performance options for streaming."
            />

            <div className="divide-y divide-white/5">

              <ToggleSetting
                label="Hardware Acceleration"
                description="Use supported hardware encoding capabilities."
                checked={settings.hardwareAcceleration}
                onChange={(value) =>
                  updateSetting(
                    "hardwareAcceleration",
                    value
                  )
                }
              />

              <ToggleSetting
                label="Low Latency Mode"
                description="Prioritize lower streaming latency."
                checked={settings.lowLatency}
                onChange={(value) =>
                  updateSetting(
                    "lowLatency",
                    value
                  )
                }
              />

              <ToggleSetting
                label="Automatic Reconnection"
                description="Automatically reconnect when a destination connection is interrupted."
                checked={settings.autoReconnect}
                onChange={(value) =>
                  updateSetting(
                    "autoReconnect",
                    value
                  )
                }
              />

            </div>
          </SettingsCard>

          <SettingsCard>
            <SectionHeader
              title="Reconnection"
              description="Configure reconnection behavior."
            />

            <InputField
              label="Maximum Reconnection Attempts"
              description="Maximum number of reconnection attempts."
              type="number"
              value={settings.reconnectAttempts}
              onChange={(e) =>
                updateSetting(
                  "reconnectAttempts",
                  e.target.value
                )
              }
            />

          </SettingsCard>

        </div>
      )}

      {/* ================================================== */}
      {/* INFORMATION */}
      {/* ================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">

        <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />

        <div>
          <p className="text-sm font-medium text-white">
            Settings Preview
          </p>

          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            These settings currently operate in frontend simulation mode.
            Saving preferences stores them locally in your browser.
            Actual encoder and streaming configuration will be integrated
            with the backend in a later development stage.
          </p>
        </div>

      </div>

    </div>
  );
}
