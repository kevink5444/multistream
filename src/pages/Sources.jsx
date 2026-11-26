import { api } from "../services/api";
import { useEffect, useRef, useState } from "react";

import {
  Video,
  FileVideo,
  Mic,
  Radio,
  Plus,
  Settings2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Power,
  X,
  Activity,
  Search,
  Play,
  Square,
  RefreshCw,
} from "lucide-react";

  // =====================================================
  // ACTIVITY LOG HELPER  <-- TARUH DI SINI
  // =====================================================

  async function logSourceActivity({
    type = "info",
    title,
    description,
    source = null,
    metadata = {},
  }) {
    try {
      await api.createActivityLog({
        type,
        category: "source",
        title,
        description,
        destination: source?.name || "Source Manager",
        metadata: {
          sourceId: source?.id ?? null,
          sourceType: source?.type ?? null,
          ...metadata,
        },
      });
    } catch (error) {
      console.error(
        "Failed to create source activity log:",
        error
      );
    }
  }
/* =========================================================
   SOURCE TYPES
========================================================= */

const sourceTypes = {
  camera: {
    label: "Camera",
    icon: Video,
    color: "text-blue-400",
    background: "bg-blue-500/10",
  },

  video: {
    label: "Video File",
    icon: FileVideo,
    color: "text-amber-400",
    background: "bg-amber-500/10",
  },

  audio: {
    label: "Audio Input",
    icon: Mic,
    color: "text-emerald-400",
    background: "bg-emerald-500/10",
  },

  rtmp: {
    label: "RTMP Input",
    icon: Radio,
    color: "text-rose-400",
    background: "bg-rose-500/10",
  },
};

/* =========================================================
   STATUS BADGE
========================================================= */

function SourceStatusBadge({ status }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        active
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-slate-500/20 bg-slate-500/10 text-slate-400"
      }`}
    >
      {active ? (
        <CheckCircle2 size={13} />
    ) : (
      <AlertCircle size={13} />
    )}

    {active ? "Active" : "Inactive"}
  </span>
  );
}
/* =========================================================
   SOURCE CARD
========================================================= */

function SourceCard({
  source,
  onToggle,
  onSettings,
  onDelete,
}) {
  const config = sourceTypes[source.type];
  const Icon = config.icon;

  return (
    <div className="group rounded-xl border border-white/5 bg-[#15151e] p-4 transition hover:border-white/10 hover:bg-[#191923]">

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.background}`}
          >
            <Icon size={21} className={config.color} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              {source.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {config.label}
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => onSettings(source)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
          aria-label={`Settings for ${source.name}`}
        >
          <Settings2 size={17} />
        </button>

      </div>

      <div className="mt-4 flex items-center justify-between">
        <SourceStatusBadge status={source.status} />

        {source.status === "active" && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Running
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3 border-t border-white/5 pt-4">

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Input
          </span>

          <span className="truncate text-xs font-medium text-slate-300">
            {source.device || "Not configured"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Resolution
          </span>

          <span className="text-xs font-medium text-slate-300">
            {source.resolution || "-"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Frame Rate
          </span>

          <span className="text-xs font-medium text-slate-300">
            {source.fps || "-"}
          </span>
        </div>

      </div>

      <div className="mt-4 flex gap-2">

        <button
          type="button"
          onClick={() => onToggle(source.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
            source.status === "active"
              ? "border-white/5 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white"
              : "border-emerald-500/10 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          <Power size={14} />

          {source.status === "active"
            ? "Disable"
            : "Enable"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(source.id)}
          className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-slate-500 transition hover:border-red-500/10 hover:bg-red-500/5 hover:text-red-400"
          aria-label={`Remove ${source.name}`}
        >
          <Trash2 size={14} />
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   ADD SOURCE MODAL
========================================================= */

function AddSourceModal({ onClose, onAdd }) {
  const [sourceType, setSourceType] = useState("camera");
  const [sourceName, setSourceName] = useState("");

  const config = sourceTypes[sourceType];

  const handleSubmit = (event) => {
    event.preventDefault();

    const newSource = {
      id: Date.now(),
      name:
        sourceName.trim() ||
        `${config.label} ${Date.now().toString().slice(-4)}`,
      type: sourceType,
      device: "",
      resolution: "-",
      fps: "-",
      status: "inactive",
      settings: {},
    };

    onAdd(newSource);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151e] shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/5 p-5">

          <div>
            <h2 className="text-base font-semibold text-white">
              Add Source
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add a new input to your streaming setup
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Source Type
            </label>

            <select
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
            >
              <option value="camera">Camera</option>
              <option value="video">Video File</option>
              <option value="audio">Audio Input</option>
              <option value="rtmp">RTMP Input</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Source Name
            </label>

            <input
              type="text"
              value={sourceName}
              onChange={(event) => setSourceName(event.target.value)}
              placeholder="Enter source name"
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          <div className="rounded-lg border border-violet-500/10 bg-violet-500/5 p-3">
            <p className="text-xs leading-relaxed text-slate-400">
              Configure the input device, file, or RTMP connection
              after creating this source.
            </p>
          </div>

          <div className="flex gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500"
            >
              <Plus size={14} />
              Add Source
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* =========================================================
   SOURCE SETTINGS MODAL
========================================================= */

function SourceSettingsModal({
  source,
  onClose,
  onSave,
  onStart,
  onStop,
  onLog,
}) {
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(
    source.settings?.deviceId || ""
  );

  const [file, setFile] = useState(source.settings?.file || null);
  const [rtmpUrl, setRtmpUrl] = useState(
    source.settings?.rtmpUrl || ""
  );

  const [error, setError] = useState("");
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const config = sourceTypes[source.type];
  const Icon = config.icon;

  useEffect(() => {
    if (
      source.type === "camera" ||
      source.type === "audio"
    ) {
      loadDevices();
    }
  }, [source.type]);

  async function loadDevices() {
    setLoadingDevices(true);
    setError("");

    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error(
          "Device detection is not supported by this browser."
        );
      }

      const availableDevices =
        await navigator.mediaDevices.enumerateDevices();

      const filteredDevices = availableDevices.filter((device) => {
        if (source.type === "camera") {
          return device.kind === "videoinput";
        }

        return device.kind === "audioinput";
      });

      setDevices(filteredDevices);

      if (!deviceId && filteredDevices.length > 0) {
        setDeviceId(filteredDevices[0].deviceId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDevices(false);
    }
  }

  function handleSave() {
  setError("");
  setSaveMessage("");

  onSave(source.id, {
    deviceId,
    file,
    rtmpUrl,
    device:
      source.type === "camera" || source.type === "audio"
        ? devices.find((device) => device.deviceId === deviceId)?.label ||
          "Selected device"
        : source.type === "video"
          ? file?.name || "No video selected"
          : rtmpUrl || "RTMP Input",
  });

  setSaveMessage("Settings saved successfully.");
}

  async function handlePreview() {
  setError("");

  try {
    if (source.type === "camera") {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId
            ? { exact: deviceId }
            : undefined,
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      onStart(source.id, stream);
    }

    if (source.type === "audio") {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId
            ? { exact: deviceId }
            : undefined,
        },
        video: false,
      });

      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }

      onStart(source.id, stream);
    }

    if (source.type === "video") {
      if (!file) {
        throw new Error("Please select a video file first.");
      }

      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
        await videoRef.current.play();
      }

      onStart(source.id, null);
    }

    if (source.type === "rtmp") {
      if (!rtmpUrl.trim()) {
        throw new Error("Please enter an RTMP URL.");
      }

      handleSave();

      setError(
        "RTMP configuration saved. RTMP ingestion is not yet connected to the media engine."
      );
    }
  } catch (err) {
    const errorMessage =
      err.message || "Unable to start source.";

    setError(errorMessage);

    onLog?.({
      type: "error",
      title: "Source Preview Failed",
      description: `${source.name}: ${errorMessage}`,
      source,
      metadata: {
        action: "preview_failed",
        errorName: err.name || "UnknownError",
      },
    });
  }
}

  function handleStopPreview() {
  // Stop seluruh track video/audio
  const videoStream = videoRef.current?.srcObject;

  if (videoStream) {
    videoStream.getTracks().forEach((track) => {
      track.stop();
    });

    videoRef.current.srcObject = null;
  }

  // Bersihkan preview video
  if (videoRef.current) {
    videoRef.current.pause();
    videoRef.current.removeAttribute("src");
    videoRef.current.load();
  }

  // Stop audio stream
  const audioStream = audioRef.current?.srcObject;

  if (audioStream) {
    audioStream.getTracks().forEach((track) => {
      track.stop();
    });

    audioRef.current.srcObject = null;
  }

  // Update status Source di parent
  onStop(source.id);
}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#15151e] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">

          <div className="flex items-center gap-3">

            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.background}`}>
              <Icon size={20} className={config.color} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Source Settings
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {source.name}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>

        <div className="space-y-5 p-5">

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <span className="text-xs text-slate-400">
              Source Status
            </span>

            <SourceStatusBadge status={source.status} />
          </div>

          {/* Camera */}
          {source.type === "camera" && (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Camera Device
                </label>

                <select
                  value={deviceId}
                  onChange={(event) => setDeviceId(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                >
                  {devices.map((device, index) => (
                    <option
                      key={device.deviceId}
                      value={device.deviceId}
                    >
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={loadDevices}
                  className="mt-2 flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300"
                >
                  <RefreshCw size={13} />
                  Refresh Devices
                </button>
              </div>

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="aspect-video w-full rounded-lg bg-black object-contain"
              />
            </>
          )}

          {/* Video */}
          {source.type === "video" && (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Video File
                </label>

                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) =>
                    setFile(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#1c1c27] p-2 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-2 file:text-xs file:text-white"
                />

                {file && (
                  <p className="mt-2 truncate text-xs text-emerald-400">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <video
                ref={videoRef}
                controls
                playsInline
                className="aspect-video w-full rounded-lg bg-black object-contain"
              />
            </>
          )}

          {/* Audio */}
          {source.type === "audio" && (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Microphone / Audio Device
                </label>

                <select
                  value={deviceId}
                  onChange={(event) => setDeviceId(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                >
                  {devices.map((device, index) => (
                    <option
                      key={device.deviceId}
                      value={device.deviceId}
                    >
                      {device.label || `Audio Device ${index + 1}`}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={loadDevices}
                  className="mt-2 flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300"
                >
                  <RefreshCw size={13} />
                  Refresh Devices
                </button>
              </div>

              <audio ref={audioRef} autoPlay controls className="w-full" />

              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <p className="text-xs text-slate-400">
                  Audio capture is available for browser preview.
                  Streaming-engine integration will be added separately.
                </p>
              </div>
            </>
          )}

          {/* RTMP */}
          {source.type === "rtmp" && (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  RTMP Input URL
                </label>

                <input
                  type="text"
                  value={rtmpUrl}
                  onChange={(event) => setRtmpUrl(event.target.value)}
                  placeholder="rtmp://localhost:1935/live/stream"
                  className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                />
              </div>

              <div className="rounded-lg border border-rose-500/10 bg-rose-500/5 p-3">
                <p className="text-xs leading-relaxed text-slate-400">
                  The RTMP server currently accepts incoming streams
                  through the backend. This field stores the input
                  configuration, but automatic stream detection and
                  media preview have not been connected yet.
                </p>
              </div>
            </>
          )}

          {loadingDevices && (
            <p className="text-xs text-slate-500">
              Detecting devices...
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">
              <p className="text-xs leading-relaxed text-amber-400">
                {error}
              </p>
            </div>
          )}
          {saveMessage && (
            <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
               <p className="text-xs text-emerald-400">
                 ✓ {saveMessage}
               </p>
              </div>
          )}
          {/* Actions */}
          <div className="flex gap-2">

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07]"
            >
              Save Settings
            </button>

            {source.status === "active" ? (
              <button
                type="button"
                onClick={handleStopPreview}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-red-500"
              >
                <Square size={14} />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePreview}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500"
              >
                <Play size={14} />
                Start Preview
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
  
}

/* =========================================================
   MAIN SOURCES COMPONENT
========================================================= */

function Sources() {
const [sources, setSources] = useState(() => {
  try {
    const savedSources = localStorage.getItem("multistream_sources");

    if (!savedSources) return [];

    return JSON.parse(savedSources).map((source) => ({
      ...source,

      wasActive:
        source.wasActive ??
        source.status === "active",

      status: "inactive",
    }));
  } catch (error) {
    console.error("Failed to load sources:", error);
    return [];
  }
});
  const [searchQuery, setSearchQuery] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const streamsRef = useRef({});
  const autoReconnectAttemptedRef = useRef(false);
  const deviceChangeHandlersRef = useRef({});
  const disconnectCheckersRef = useRef({});
  const activeSources = sources.filter(
    (source) => source.status === "active"
  );

  const inactiveSources = sources.filter(
    (source) => source.status !== "active"
  );

  const filteredSources = sources.filter((source) =>
    `${source.name} ${source.type} ${source.device}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  /* =====================================================
     ADD SOURCE
  ===================================================== */

  function handleAddSource(newSource) {
  setSources((previous) => [
    ...previous,
    newSource,
  ]);

  logSourceActivity({
    type: "success",
    title: "Source Added",
    description: `${newSource.name} was added to the source manager.`,
    source: newSource,
    metadata: {
      action: "source_added",
    },
  });
}

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  function handleSaveSettings(sourceId, settings) {
  const source = sources.find(
    (item) => item.id === sourceId
  );

  setSources((previous) =>
    previous.map((item) =>
      item.id === sourceId
        ? {
            ...item,
            settings,
            device: settings.device,
          }
        : item
    )
  );

  setSelectedSource((previous) =>
    previous && previous.id === sourceId
      ? {
            ...previous,
            settings,
            device: settings.device,
        }
      : previous
  );

  logSourceActivity({
    type: "info",
    title: "Source Settings Updated",
    description: `Settings for ${source?.name || "source"} were updated.`,
    source,
    metadata: {
      action: "settings_updated",
      device: settings.device,
    },
  });
}
  /* =====================================================
     START SOURCE
  ===================================================== */

 /* =====================================================
   START SOURCE
===================================================== */

/* =====================================================
   START SOURCE + DEVICE DISCONNECT DETECTION
===================================================== */

function handleStartSource(sourceId, stream) {
  const source = sources.find(
    (item) => item.id === sourceId
  );

  if (stream) {
    streamsRef.current[sourceId] = stream;

    // Bersihkan listener dan checker sebelumnya
    if (deviceChangeHandlersRef.current[sourceId]) {
      navigator.mediaDevices?.removeEventListener(
        "devicechange",
        deviceChangeHandlersRef.current[sourceId]
      );
    }

    if (disconnectCheckersRef.current[sourceId]) {
      clearInterval(
        disconnectCheckersRef.current[sourceId]
      );
    }

    let disconnected = false;

    const tracks = stream.getTracks();

    const handleDeviceDisconnected = (track) => {
      // Cegah log ganda
      if (disconnected) return;

      // Pastikan stream yang diperiksa adalah stream aktif
      if (streamsRef.current[sourceId] !== stream) {
        return;
      }

      disconnected = true;

      console.warn(
        "DEVICE DISCONNECTED DETECTED",
        {
          sourceId,
          trackKind: track?.kind,
          trackLabel: track?.label,
          readyState: track?.readyState,
        }
      );

      // Bersihkan checker
      if (disconnectCheckersRef.current[sourceId]) {
        clearInterval(
          disconnectCheckersRef.current[sourceId]
        );

        delete disconnectCheckersRef.current[sourceId];
      }

      // Bersihkan listener devicechange
      if (deviceChangeHandlersRef.current[sourceId]) {
        navigator.mediaDevices?.removeEventListener(
          "devicechange",
          deviceChangeHandlersRef.current[sourceId]
        );

        delete deviceChangeHandlersRef.current[sourceId];
      }

      // Stop track lain yang masih aktif
      tracks.forEach((currentTrack) => {
        if (currentTrack.readyState !== "ended") {
          currentTrack.stop();
        }
      });

      // Hapus stream aktif
      delete streamsRef.current[sourceId];

      // Update status Source
      setSources((previous) =>
        previous.map((item) =>
          item.id === sourceId
            ? {
                ...item,
                status: "inactive",
                wasActive: false,
              }
            : item
        )
      );

      // Update selected Source
      setSelectedSource((previous) =>
        previous && previous.id === sourceId
          ? {
              ...previous,
              status: "inactive",
              wasActive: false,
            }
          : previous
      );

      // Activity Log
      logSourceActivity({
        type: "warning",
        title: "Source Device Disconnected",
        description: `${source?.name || "Source"} device connection ended unexpectedly.`,
        source,
        metadata: {
          action: "device_disconnected",
          trackKind: track?.kind || "unknown",
        },
      });
    };

    // ================================================
    // 1. TRACK ENDED EVENT
    // ================================================

    tracks.forEach((track) => {
      track.addEventListener("ended", () => {
        handleDeviceDisconnected(track);
      });
    });

    // ================================================
    // 2. DEVICE CHANGE EVENT
    // ================================================

    const checkDeviceConnection = async () => {
      if (disconnected) return;

      if (streamsRef.current[sourceId] !== stream) {
        return;
      }

      try {
        // Periksa track
        const endedTrack = tracks.find(
          (track) => track.readyState === "ended"
        );

        if (endedTrack) {
          handleDeviceDisconnected(endedTrack);
          return;
        }

        // Periksa device fisik
        const availableDevices =
          await navigator.mediaDevices.enumerateDevices();

        for (const track of tracks) {
          const activeDeviceId =
            track.getSettings().deviceId;

          if (!activeDeviceId) continue;

          const deviceExists = availableDevices.some(
            (device) =>
              device.deviceId === activeDeviceId
          );

          if (!deviceExists) {
            handleDeviceDisconnected(track);
            return;
          }
        }
      } catch (error) {
        console.error(
          "Device connection check failed:",
          error
        );
      }
    };

    const deviceChangeHandler = () => {
      console.log("DEVICE CHANGE EVENT DETECTED");

      checkDeviceConnection();
    };

    navigator.mediaDevices?.addEventListener(
      "devicechange",
      deviceChangeHandler
    );

    deviceChangeHandlersRef.current[sourceId] =
      deviceChangeHandler;

    // ================================================
    // 3. PERIODIC DEVICE CHECK
    // ================================================

    disconnectCheckersRef.current[sourceId] =
      setInterval(checkDeviceConnection, 2000);

    // Diagnostic
    console.log("SOURCE DEVICE MONITOR STARTED", {
      sourceId,
      sourceName: source?.name,
      tracks: tracks.map((track) => ({
        kind: track.kind,
        label: track.label,
        readyState: track.readyState,
        deviceId: track.getSettings().deviceId,
      })),
    });
  }

  // ================================================
  // UPDATE SOURCE STATUS
  // ================================================

  setSources((previous) =>
    previous.map((item) =>
      item.id === sourceId
        ? {
            ...item,
            status: "active",
            wasActive: true,
          }
        : item
    )
  );

  setSelectedSource((previous) =>
    previous && previous.id === sourceId
      ? {
          ...previous,
          status: "active",
          wasActive: true,
        }
      : previous
  );

  // ================================================
  // ACTIVITY LOG PREVIEW STARTED
  // ================================================

  logSourceActivity({
    type: "success",
    title: "Source Preview Started",
    description: `${source?.name || "Source"} preview started successfully.`,
    source,
    metadata: {
      action: "preview_started",
    },
  });
}
  /* =====================================================
   AUTO RECONNECT SOURCES
===================================================== */

async function handleAutoReconnect(source) {
  try {
    if (
      source.type !== "camera" &&
      source.type !== "audio"
    ) {
      return;
    }

    const deviceId = source.settings?.deviceId;

    let stream;

    if (source.type === "camera") {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId
            ? { exact: deviceId }
            : undefined,
        },
        audio: false,
      });
    }

    if (source.type === "audio") {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId
            ? { exact: deviceId }
            : undefined,
        },
        video: false,
      });
    }

    handleStartSource(source.id, stream);

  } catch (error) {
  console.error(
    `Auto reconnect failed for ${source.name}:`,
    error
  );

  logSourceActivity({
    type: "warning",
    title: "Source Auto-Reconnect Failed",
    description: `Unable to reconnect ${source.name}: ${error.message}`,
    source,
    metadata: {
      action: "auto_reconnect_failed",
      errorName: error.name || "UnknownError",
    },
  });
}
}
  /* =====================================================
     STOP SOURCE
  ===================================================== */

  function handleStopSource(sourceId, shouldLog = true) {
  const source = sources.find(
    (item) => item.id === sourceId
  );

  const stream = streamsRef.current[sourceId];

  if (stream) {
  // Hapus listener devicechange
  if (deviceChangeHandlersRef.current[sourceId]) {
    navigator.mediaDevices?.removeEventListener(
      "devicechange",
      deviceChangeHandlersRef.current[sourceId]
    );

    
    if (disconnectCheckersRef.current[sourceId]) {
  clearInterval(
    disconnectCheckersRef.current[sourceId]
  );
  delete deviceChangeHandlersRef.current[sourceId];
}
  }

  // Stop semua track
  stream.getTracks().forEach((track) => {
    track.stop();
  });

  // Hapus stream
  delete streamsRef.current[sourceId];
}
  setSources((previous) =>
    previous.map((item) =>
      item.id === sourceId
        ? {
              ...item,
              status: "inactive",
              wasActive: false,
          }
        : item
    )
  );

  setSelectedSource((previous) =>
    previous && previous.id === sourceId
      ? {
              ...previous,
              status: "inactive",
              wasActive: false,
          }
        : previous
  );

  if (shouldLog) {
    logSourceActivity({
      type: "info",
      title: "Source Preview Stopped",
      description: `${source?.name || "Source"} preview was stopped.`,
      source,
      metadata: {
        action: "preview_stopped",
      },
    });
  }
}

  /* =====================================================
     TOGGLE SOURCE
  ===================================================== */

  function handleToggleSource(sourceId) {
    const source = sources.find(
      (item) => item.id === sourceId
    );

    if (!source) return;

    if (source.status === "active") {
      handleStopSource(sourceId);
      return;
    }

    setSelectedSource(source);
  }

  /* =====================================================
     DELETE SOURCE
  ===================================================== */

  function handleDeleteSource(sourceId) {
  const source = sources.find(
    (item) => item.id === sourceId
  );

  // Stop Source tanpa membuat log Stop tambahan
  handleStopSource(sourceId, false);

  setSources((previous) =>
    previous.filter((item) => item.id !== sourceId)
  );

  if (selectedSource?.id === sourceId) {
    setSelectedSource(null);
  }

  logSourceActivity({
    type: "warning",
    title: "Source Deleted",
    description: `${source?.name || "Source"} was removed from the source manager.`,
    source,
    metadata: {
      action: "source_deleted",
    },
  });
}

/* =====================================================
   SAVE SOURCES TO LOCAL STORAGE
===================================================== */

useEffect(() => {
  try {
    const sourcesToSave = sources.map((source) => ({
      ...source,

      wasActive:
        source.status === "active"
          ? true
          : source.wasActive ?? false,

      status: source.status,

      settings: {
        ...source.settings,
        file: null,
      },
    }));

    localStorage.setItem(
      "multistream_sources",
      JSON.stringify(sourcesToSave)
    );
  } catch (error) {
    console.error("Failed to save sources:", error);
  }
}, [sources]);


/* =====================================================
   AUTO RECONNECT SOURCES
===================================================== */

useEffect(() => {
  if (autoReconnectAttemptedRef.current) {
    return;
  }

  autoReconnectAttemptedRef.current = true;

  const reconnectableSources = sources.filter(
    (source) =>
      source.wasActive &&
      (source.type === "camera" || source.type === "audio")
  );

  async function reconnectSources() {
    for (const source of reconnectableSources) {
      await handleAutoReconnect(source);
    }
  }

  reconnectSources();
}, []);
 

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-xl font-semibold text-white">
            Sources
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage video and audio inputs for your streaming setup.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          <Plus size={16} />
          Add Source
        </button>

      </div>

      {/* Status Banner */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-[#12151c] p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Activity size={19} className="text-violet-400" />
          </div>

          <div>
            <h3 className="text-sm font-medium text-white">
              Source Management
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Configure camera, video, audio, and RTMP inputs.
            </p>
          </div>

        </div>

        <span className="rounded-lg border border-blue-500/10 bg-blue-500/5 px-3 py-1.5 text-xs text-blue-400">
          Browser Input Manager
        </span>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total Sources
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <Video size={17} className="text-violet-400" />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {sources.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Configured inputs
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Active Sources
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 size={17} className="text-emerald-400" />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {activeSources.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Currently enabled
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Inactive Sources
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-500/10">
              <Power size={17} className="text-slate-400" />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {inactiveSources.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Disabled inputs
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Source Types
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Radio size={17} className="text-blue-400" />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {new Set(sources.map((source) => source.type)).size}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Different input types
          </p>
        </div>

      </div>

      {/* Available Source Types */}
      <div className="rounded-2xl border border-white/5 bg-[#111118] p-5">

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">
            Available Source Types
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Supported input categories
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          {Object.entries(sourceTypes).map(([type, config]) => {
            const Icon = config.icon;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center transition hover:border-violet-500/20 hover:bg-violet-500/5"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.background}`}>
                  <Icon size={20} className={config.color} />
                </div>

                <span className="text-xs font-medium text-slate-300">
                  {config.label}
                </span>
              </button>
            );
          })}

        </div>

      </div>

      {/* Source List */}
      <div className="rounded-2xl border border-white/5 bg-[#111118]">

        <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-base font-semibold text-white">
              Configured Sources
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage all your input sources
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sources..."
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white outline-none transition focus:border-violet-500/30"
            />

          </div>

        </div>

        {filteredSources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">

            {filteredSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onToggle={handleToggleSource}
                onSettings={setSelectedSource}
                onDelete={handleDeleteSource}
              />
            ))}

          </div>
        ) : (
          <div className="p-12 text-center">

            <Video size={32} className="mx-auto text-slate-600" />

            <h3 className="mt-3 text-sm font-medium text-white">
              {sources.length === 0
                ? "No sources configured"
                : "No sources found"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {sources.length === 0
                ? "Add your first input source to get started."
                : "Try a different search."}
            </p>

            {sources.length === 0 && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
              >
                <Plus size={14} />
                Add Source
              </button>
            )}

          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">

          <p className="text-xs text-slate-500">
            Showing {filteredSources.length} of {sources.length} sources
          </p>

          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            MultiStream Input Manager
          </span>

        </div>

      </div>

      {/* Modals */}
      {addModalOpen && (
        <AddSourceModal
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddSource}
        />
      )}

      {selectedSource && (
        <SourceSettingsModal
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
          onSave={handleSaveSettings}
          onStart={handleStartSource}
          onStop={handleStopSource}
          onLog={logSourceActivity}
        />
      )}

    </div>
  );
}

export default Sources;
