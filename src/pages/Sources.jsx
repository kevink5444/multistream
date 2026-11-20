import { useState } from "react";

import {
  Video,
  Monitor,
  AppWindow,
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
} from "lucide-react";

/* =========================================================
   SOURCE CONFIGURATION
========================================================= */

const sourceTypes = {
  camera: {
    label: "Camera",
    icon: Video,
    color: "text-blue-400",
    background: "bg-blue-500/10",
  },

  screen: {
    label: "Screen Capture",
    icon: Monitor,
    color: "text-violet-400",
    background: "bg-violet-500/10",
  },

  window: {
    label: "Window Capture",
    icon: AppWindow,
    color: "text-cyan-400",
    background: "bg-cyan-500/10",
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
   INITIAL DATA
========================================================= */

const initialSources = [
  {
    id: 1,
    name: "Main Camera",
    type: "camera",
    device: "USB Camera",
    resolution: "1920 × 1080",
    fps: "30 FPS",
    status: "active",
  },
  {
    id: 2,
    name: "Desktop Capture",
    type: "screen",
    device: "Display 1",
    resolution: "1920 × 1080",
    fps: "60 FPS",
    status: "active",
  },
  {
    id: 3,
    name: "Game Capture",
    type: "window",
    device: "Game Window",
    resolution: "1920 × 1080",
    fps: "60 FPS",
    status: "inactive",
  },
  {
    id: 4,
    name: "Background Music",
    type: "audio",
    device: "Default Audio Device",
    resolution: "-",
    fps: "-",
    status: "active",
  },
];

/* =========================================================
   SOURCE STATUS BADGE
========================================================= */

function SourceStatusBadge({ status }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-slate-500/20 bg-slate-500/10 text-slate-400"
      }`}
    >
      {isActive ? (
        <CheckCircle2 size={13} />
      ) : (
        <AlertCircle size={13} />
      )}

      {isActive ? "Active" : "Inactive"}
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

  const SourceIcon = config.icon;

  return (
    <div className="group rounded-xl border border-white/5 bg-[#15151e] p-4 transition hover:border-white/10 hover:bg-[#191923]">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.background}`}
          >
            <SourceIcon
              size={21}
              className={config.color}
            />
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

      {/* Status */}
      <div className="mt-4 flex items-center justify-between">

        <SourceStatusBadge status={source.status} />

        {source.status === "active" && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

            Active
          </span>
        )}

      </div>

      {/* Information */}
      <div className="mt-4 space-y-3 border-t border-white/5 pt-4">

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Device
          </span>

          <span className="truncate text-xs font-medium text-slate-300">
            {source.device}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Resolution
          </span>

          <span className="text-xs font-medium text-slate-300">
            {source.resolution}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Frame Rate
          </span>

          <span className="text-xs font-medium text-slate-300">
            {source.fps}
          </span>
        </div>

      </div>

      {/* Actions */}
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

  const [deviceName, setDeviceName] = useState("");

  const config = sourceTypes[sourceType];

  const handleSubmit = (event) => {
    event.preventDefault();

    const newSource = {
      id: Date.now(),
      name:
        sourceName ||
        `${config.label} ${Date.now().toString().slice(-4)}`,
      type: sourceType,
      device: deviceName || "Default Device",
      resolution:
        sourceType === "audio"
          ? "-"
          : "1920 × 1080",
      fps:
        sourceType === "audio"
          ? "-"
          : "30 FPS",
      status: "inactive",
    };

    onAdd(newSource);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151e] shadow-2xl">

        {/* Header */}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5"
        >

          {/* Source Type */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Source Type
            </label>

            <select
              value={sourceType}
              onChange={(event) =>
                setSourceType(event.target.value)
              }
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
            >
              <option value="camera">Camera</option>
              <option value="screen">Screen Capture</option>
              <option value="window">Window Capture</option>
              <option value="video">Video File</option>
              <option value="audio">Audio Input</option>
              <option value="rtmp">RTMP Input</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Source Name
            </label>

            <input
              type="text"
              value={sourceName}
              onChange={(event) =>
                setSourceName(event.target.value)
              }
              placeholder="Enter source name"
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* Device */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Device / Input
            </label>

            <input
              type="text"
              value={deviceName}
              onChange={(event) =>
                setDeviceName(event.target.value)
              }
              placeholder={
                sourceType === "camera"
                  ? "USB Camera"
                  : sourceType === "screen"
                    ? "Display 1"
                    : sourceType === "window"
                      ? "Application Window"
                      : sourceType === "video"
                        ? "Video File"
                        : sourceType === "audio"
                          ? "Audio Device"
                          : "RTMP URL"
              }
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* Notice */}
          <div className="rounded-lg border border-violet-500/10 bg-violet-500/5 p-3">
            <p className="text-xs leading-relaxed text-slate-400">
              Source creation currently uses frontend simulation.
              Device detection and actual video capture will be
              connected to the streaming engine later.
            </p>
          </div>

          {/* Buttons */}
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

function SourceSettingsModal({ source, onClose }) {
  if (!source) return null;

  const config = sourceTypes[source.type];

  const SourceIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151e] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.background}`}
            >
              <SourceIcon
                size={20}
                className={config.color}
              />
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

        {/* Content */}
        <div className="space-y-4 p-5">

          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <span className="text-xs text-slate-400">
              Source Status
            </span>

            <SourceStatusBadge status={source.status} />
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Source Type
            </p>

            <p className="mt-1 text-sm text-white">
              {config.label}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Device
            </p>

            <p className="mt-1 text-sm text-white">
              {source.device}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-slate-500">
                Resolution
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {source.resolution}
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-slate-500">
                Frame Rate
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {source.fps}
              </p>
            </div>

          </div>

          <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">
            <p className="text-xs leading-relaxed text-amber-400/80">
              Device configuration and video capture settings
              will be connected to the MultiStream engine
              in a future implementation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500"
          >
            Close Settings
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SOURCES PAGE
========================================================= */

function Sources() {
  const [sources, setSources] = useState(initialSources);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [selectedSource, setSelectedSource] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  /* =========================================================
     SUMMARY
  ========================================================= */

  const activeSources = sources.filter(
    (source) => source.status === "active"
  );

  const inactiveSources = sources.filter(
    (source) => source.status === "inactive"
  );

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredSources = sources.filter((source) =>
    source.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  /* =========================================================
     ADD SOURCE
  ========================================================= */

  const handleAddSource = (newSource) => {
    setSources((previous) => [
      ...previous,
      newSource,
    ]);
  };

  /* =========================================================
     TOGGLE SOURCE
  ========================================================= */

  const handleToggleSource = (sourceId) => {
    setSources((previous) =>
      previous.map((source) =>
        source.id === sourceId
          ? {
              ...source,
              status:
                source.status === "active"
                  ? "inactive"
                  : "active",
            }
          : source
      )
    );
  };

  /* =========================================================
     DELETE SOURCE
  ========================================================= */

  const handleDeleteSource = (sourceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this source?"
    );

    if (!confirmed) return;

    setSources((previous) =>
      previous.filter(
        (source) => source.id !== sourceId
      )
    );
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
         PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white">
              Stream Sources
            </h1>

            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-400">
              INPUTS
            </span>
          </div>

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

      {/* =====================================================
         STATUS BANNER
      ===================================================== */}

      <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-[#12151c] p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Activity
              size={19}
              className="text-violet-400"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-white">
              Source Management
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Configure the inputs that will be used by your streaming engine.
            </p>
          </div>

        </div>

        <span className="rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-400">
          Frontend Simulation
        </span>

      </div>

      {/* =====================================================
         STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

        {/* Total */}
        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Total Sources
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <Video
                size={17}
                className="text-violet-400"
              />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {sources.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Configured inputs
          </p>

        </div>

        {/* Active */}
        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Active Sources
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2
                size={17}
                className="text-emerald-400"
              />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {activeSources.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Currently enabled
          </p>

        </div>

        {/* Inactive */}
        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Inactive Sources
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-500/10">
              <Power
                size={17}
                className="text-slate-400"
              />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {inactiveSources.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Disabled inputs
          </p>

        </div>

        {/* Types */}
        <div className="rounded-xl border border-white/5 bg-[#12121a] p-4">

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Source Types
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Radio
                size={17}
                className="text-blue-400"
              />
            </div>
          </div>

          <p className="mt-3 text-2xl font-semibold text-white">
            {new Set(
              sources.map((source) => source.type)
            ).size}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Different input types
          </p>

        </div>

      </div>

      {/* =====================================================
         SOURCE TYPE QUICK ACCESS
      ===================================================== */}

      <div className="rounded-2xl border border-white/5 bg-[#111118] p-5">

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">
            Available Source Types
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Supported input categories
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

          {Object.entries(sourceTypes).map(
            ([type, config]) => {
              const Icon = config.icon;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setAddModalOpen(true);
                  }}
                  className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center transition hover:border-violet-500/20 hover:bg-violet-500/5"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.background}`}
                  >
                    <Icon
                      size={20}
                      className={config.color}
                    />
                  </div>

                  <span className="text-xs font-medium text-slate-300">
                    {config.label}
                  </span>
                </button>
              );
            }
          )}

        </div>

      </div>

      {/* =====================================================
         SOURCE LIST
      ===================================================== */}

      <div className="rounded-2xl border border-white/5 bg-[#111118]">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-base font-semibold text-white">
              Configured Sources
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage all your input sources
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search sources..."
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white outline-none transition focus:border-violet-500/30"
            />

          </div>

        </div>

        {/* Cards */}
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

            <Video
              size={32}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-3 text-sm font-medium text-white">
              No sources found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Try a different search or add a new source.
            </p>

          </div>
        )}

        {/* Footer */}
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

      {/* =====================================================
         MODALS
      ===================================================== */}

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
        />
      )}

    </div>
  );
}

export default Sources;