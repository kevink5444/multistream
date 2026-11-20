import { useState } from "react";

import {
  Radio,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings2,
  ExternalLink,
  Activity,
  Plus,
  RefreshCw,
  X,
  Save,
  Trash2,
} from "lucide-react";

import {
  FaYoutube,
  FaTwitch,
  FaFacebook,
} from "react-icons/fa";

/* =========================================================
   INITIAL DESTINATION DATA
   ========================================================= */

const initialDestinations = [
  {
    id: 1,
    name: "YouTube Live",
    platform: "YouTube",
    account: "Kevin Gaming",
    status: "connected",
    bitrate: "6,000 Kbps",
    resolution: "1080p",
    fps: "60 FPS",
    icon: FaYoutube,
    iconColor: "text-red-500",
    backgroundColor: "bg-red-500/10",
  },
  {
    id: 2,
    name: "Twitch",
    platform: "Twitch",
    account: "kevin_stream",
    status: "connected",
    bitrate: "6,000 Kbps",
    resolution: "1080p",
    fps: "60 FPS",
    icon: FaTwitch,
    iconColor: "text-purple-500",
    backgroundColor: "bg-purple-500/10",
  },
  {
    id: 3,
    name: "Facebook Live",
    platform: "Facebook",
    account: "Kevin Gaming",
    status: "connecting",
    bitrate: "6,000 Kbps",
    resolution: "1080p",
    fps: "60 FPS",
    icon: FaFacebook,
    iconColor: "text-blue-500",
    backgroundColor: "bg-blue-500/10",
  },
  {
    id: 4,
    name: "Custom RTMP",
    platform: "RTMP",
    account: "Custom Server",
    status: "disconnected",
    bitrate: "-",
    resolution: "-",
    fps: "-",
    icon: Radio,
    iconColor: "text-slate-400",
    backgroundColor: "bg-slate-500/10",
  },
];

/* =========================================================
   PLATFORM CONFIGURATION
   ========================================================= */

const platformConfig = {
  YouTube: {
    icon: FaYoutube,
    iconColor: "text-red-500",
    backgroundColor: "bg-red-500/10",
  },

  Twitch: {
    icon: FaTwitch,
    iconColor: "text-purple-500",
    backgroundColor: "bg-purple-500/10",
  },

  Facebook: {
    icon: FaFacebook,
    iconColor: "text-blue-500",
    backgroundColor: "bg-blue-500/10",
  },

  RTMP: {
    icon: Radio,
    iconColor: "text-slate-400",
    backgroundColor: "bg-slate-500/10",
  },
};

/* =========================================================
   STATUS CONFIGURATION
   ========================================================= */

const destinationStatusConfig = {
  connected: {
    label: "Connected",
    icon: CheckCircle2,
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },

  connecting: {
    label: "Connecting",
    icon: Clock,
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },

  disconnected: {
    label: "Disconnected",
    icon: AlertCircle,
    className:
      "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

/* =========================================================
   STATUS BADGE
   ========================================================= */

function DestinationStatusBadge({ status }) {
  const statusConfig =
    destinationStatusConfig[status] ??
    destinationStatusConfig.disconnected;

  const StatusIcon = statusConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
    >
      <StatusIcon size={13} />

      {statusConfig.label}
    </span>
  );
}

/* =========================================================
   DESTINATION CARD
   ========================================================= */

function DestinationCard({
  destination,
  onSettings,
  onReconnect,
  onDelete,
}) {
  const DestinationIcon = destination.icon;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group rounded-xl border border-white/5 bg-[#15151e] p-4 transition-all duration-200 hover:border-white/10 hover:bg-[#191923]">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          {/* Platform Icon */}
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${destination.backgroundColor}`}
          >
            <DestinationIcon
              className={destination.iconColor}
              size={22}
            />
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {destination.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {destination.account}
            </p>
          </div>

        </div>

        {/* More Options */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label={`More options for ${destination.name}`}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-white/10 bg-[#1c1c27] shadow-xl">

              <button
                type="button"
                onClick={() => {
                  onSettings(destination);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <Settings2 size={14} />
                Settings
              </button>

              <button
                type="button"
                onClick={() => {
                  onReconnect(destination.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <RefreshCw size={14} />
                Reconnect
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete(destination.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 border-t border-white/5 px-3 py-2.5 text-left text-xs text-red-400 transition hover:bg-red-500/5"
              >
                <Trash2 size={14} />
                Remove
              </button>

            </div>
          )}

        </div>

      </div>

      {/* Status */}
      <div className="mt-4 flex items-center justify-between">

        <DestinationStatusBadge
          status={destination.status}
        />

        {/* Live Indicator */}
        {destination.status === "connected" && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

            Live
          </div>
        )}

        {/* Connecting Indicator */}
        {destination.status === "connecting" && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <RefreshCw
              size={12}
              className="animate-spin"
            />

            Connecting
          </div>
        )}

      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Bitrate
          </p>

          <p className="mt-1 text-xs font-medium text-slate-300">
            {destination.bitrate}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Resolution
          </p>

          <p className="mt-1 text-xs font-medium text-slate-300">
            {destination.resolution}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Frame Rate
          </p>

          <p className="mt-1 text-xs font-medium text-slate-300">
            {destination.fps}
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">

        {/* Connected */}
        {destination.status === "connected" && (
          <button
            type="button"
            onClick={() => onSettings(destination)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            <Settings2 size={14} />

            Settings
          </button>
        )}

        {/* Connecting */}
        {destination.status === "connecting" && (
          <button
            type="button"
            disabled
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-400"
          >
            <Clock size={14} />

            Connecting...
          </button>
        )}

        {/* Disconnected */}
        {destination.status === "disconnected" && (
          <button
            type="button"
            onClick={() => onReconnect(destination.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            <RefreshCw size={14} />

            Reconnect
          </button>
        )}

        {/* External Link */}
        <button
          type="button"
          onClick={() => onSettings(destination)}
          className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
          aria-label={`Open ${destination.name} settings`}
        >
          <ExternalLink size={14} />
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   ADD DESTINATION MODAL
   ========================================================= */

function AddDestinationModal({ onClose, onAdd }) {
  const [platform, setPlatform] = useState("RTMP");
  const [account, setAccount] = useState("");
  const [customName, setCustomName] = useState("");
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");

  const config = platformConfig[platform];

  const handleSubmit = (event) => {
    event.preventDefault();

    const newDestination = {
      id: Date.now(),
      name:
        platform === "RTMP"
          ? customName || "Custom RTMP"
          : `${platform} Live`,
      platform,
      account: account || "New Account",
      status: "disconnected",
      bitrate: "-",
      resolution: "-",
      fps: "-",
      icon: config.icon,
      iconColor: config.iconColor,
      backgroundColor: config.backgroundColor,
      rtmpUrl,
      streamKey,
    };

    onAdd(newDestination);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151e] shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">

          <div>
            <h2 className="text-base font-semibold text-white">
              Add Destination
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add a new streaming platform
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

          {/* Platform */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Platform
            </label>

            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
            >
              <option value="YouTube">YouTube</option>
              <option value="Twitch">Twitch</option>
              <option value="Facebook">Facebook</option>
              <option value="RTMP">Custom RTMP</option>
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Account Name
            </label>

            <input
              type="text"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder="Enter account name"
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* Custom RTMP Name */}
          {platform === "RTMP" && (
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Destination Name
              </label>

              <input
                type="text"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="My RTMP Server"
                className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
              />
            </div>
          )}

          {/* RTMP URL */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              RTMP URL
            </label>

            <input
              type="text"
              value={rtmpUrl}
              onChange={(event) => setRtmpUrl(event.target.value)}
              placeholder="rtmp://server.example.com/live"
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* Stream Key */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Stream Key
            </label>

            <input
              type="password"
              value={streamKey}
              onChange={(event) => setStreamKey(event.target.value)}
              placeholder="Enter stream key"
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* Notice */}
          <div className="rounded-lg border border-violet-500/10 bg-violet-500/5 p-3">
            <p className="text-xs leading-relaxed text-slate-400">
              Destination ini masih bersifat simulasi frontend.
              Koneksi RTMP akan diimplementasikan saat backend
              streaming engine tersedia.
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

              Add Destination
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* =========================================================
   DESTINATION SETTINGS MODAL
   ========================================================= */

function DestinationSettingsModal({
  destination,
  onClose,
}) {
  if (!destination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151e] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${destination.backgroundColor}`}
            >
              {(() => {
                const Icon = destination.icon;

                return (
                  <Icon
                    size={20}
                    className={destination.iconColor}
                  />
                );
              })()}
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Destination Settings
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {destination.name}
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
              Connection Status
            </span>

            <DestinationStatusBadge
              status={destination.status}
            />

          </div>

          <div>
            <p className="text-xs text-slate-500">
              Platform
            </p>

            <p className="mt-1 text-sm text-white">
              {destination.platform}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Account
            </p>

            <p className="mt-1 text-sm text-white">
              {destination.account}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] text-slate-500">
                Bitrate
              </p>

              <p className="mt-1 text-xs font-medium text-white">
                {destination.bitrate}
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] text-slate-500">
                Resolution
              </p>

              <p className="mt-1 text-xs font-medium text-white">
                {destination.resolution}
              </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] text-slate-500">
                FPS
              </p>

              <p className="mt-1 text-xs font-medium text-white">
                {destination.fps}
              </p>
            </div>

          </div>

          <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">
            <p className="text-xs leading-relaxed text-amber-400/80">
              Pengaturan ini masih menggunakan data simulasi.
              Pengaturan koneksi, stream key, dan konfigurasi
              encoder akan terhubung ke backend pada tahap berikutnya.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500"
          >
            <Save size={14} />

            Close Settings
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DESTINATION LIST
   ========================================================= */

function DestinationList() {
  const [destinations, setDestinations] = useState(
    initialDestinations
  );

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [selectedDestination, setSelectedDestination] =
    useState(null);

  /* =========================================================
     SUMMARY
     ========================================================= */

  const connectedDestinations = destinations.filter(
    (destination) => destination.status === "connected"
  );

  const connectingDestinations = destinations.filter(
    (destination) => destination.status === "connecting"
  );

  const disconnectedDestinations = destinations.filter(
    (destination) => destination.status === "disconnected"
  );

  const totalDestinations = destinations.length;

  /* =========================================================
     ADD DESTINATION
     ========================================================= */

  const handleAddDestination = (newDestination) => {
    setDestinations((previous) => [
      ...previous,
      newDestination,
    ]);
  };

  /* =========================================================
     RECONNECT
     ========================================================= */

  const handleReconnect = (destinationId) => {
    setDestinations((previous) =>
      previous.map((destination) =>
        destination.id === destinationId
          ? {
              ...destination,
              status: "connecting",
            }
          : destination
      )
    );

    // Simulated connection process
    setTimeout(() => {
      setDestinations((previous) =>
        previous.map((destination) =>
          destination.id === destinationId
            ? {
                ...destination,
                status: "connected",
                bitrate: "6,000 Kbps",
                resolution: "1080p",
                fps: "60 FPS",
              }
            : destination
        )
      );
    }, 2000);
  };

  /* =========================================================
     DELETE DESTINATION
     ========================================================= */

  const handleDeleteDestination = (destinationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this destination?"
    );

    if (!confirmed) return;

    setDestinations((previous) =>
      previous.filter(
        (destination) => destination.id !== destinationId
      )
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      <div className="rounded-2xl border border-white/5 bg-[#111118]">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-base font-semibold text-white">
                Streaming Destinations
              </h2>

              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                {totalDestinations}
              </span>

            </div>

            <p className="mt-1 text-xs text-slate-500">
              Manage all your streaming platforms from one place
            </p>

          </div>

          {/* Add Destination */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
          >
            <Plus size={15} />

            Add Destination
          </button>

        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 p-5 pb-0 sm:grid-cols-4">

          {/* Connected */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-emerald-400"
              />

              <span className="text-xs text-slate-500">
                Connected
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {connectedDestinations.length}
            </p>

          </div>

          {/* Connecting */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">
              <Clock
                size={15}
                className="text-amber-400"
              />

              <span className="text-xs text-slate-500">
                Connecting
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {connectingDestinations.length}
            </p>

          </div>

          {/* Disconnected */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">
              <AlertCircle
                size={15}
                className="text-slate-400"
              />

              <span className="text-xs text-slate-500">
                Disconnected
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {disconnectedDestinations.length}
            </p>

          </div>

          {/* Total */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">
              <Activity
                size={15}
                className="text-violet-400"
              />

              <span className="text-xs text-slate-500">
                Total
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {totalDestinations}
            </p>

          </div>

        </div>

        {/* Destination Cards */}
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-2">

            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onSettings={setSelectedDestination}
                onReconnect={handleReconnect}
                onDelete={handleDeleteDestination}
              />
            ))}

          </div>
        ) : (
          <div className="p-10 text-center">

            <Radio
              size={32}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-3 text-sm font-medium text-white">
              No destinations available
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Add your first streaming destination to get started.
            </p>

            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
            >
              <Plus size={14} />

              Add Destination
            </button>

          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-white/5 px-5 py-4">

          <Radio
            size={14}
            className="text-violet-400"
          />

          <p className="text-xs text-slate-500">
            Stream distribution is managed by the MultiStream engine.
          </p>

        </div>

      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <AddDestinationModal
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddDestination}
        />
      )}

      {/* Settings Modal */}
      {selectedDestination && (
        <DestinationSettingsModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
        />
      )}

    </>
  );
}

/* =========================================================
   EXPORT
   ========================================================= */

export default DestinationList;