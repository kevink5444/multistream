import { useEffect, useState } from "react";

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
  Pencil,
  Loader2,
} from "lucide-react";

import {
  FaYoutube,
  FaTwitch,
  FaFacebook,
} from "react-icons/fa";

import { api } from "../services/api";

/* =========================================================
   PLATFORM CONFIGURATION
   ========================================================= */

const platformConfig = {
  youtube: {
    label: "YouTube",
    icon: FaYoutube,
    iconColor: "text-red-500",
    backgroundColor: "bg-red-500/10",
  },

  twitch: {
    label: "Twitch",
    icon: FaTwitch,
    iconColor: "text-purple-500",
    backgroundColor: "bg-purple-500/10",
  },

  facebook: {
    label: "Facebook",
    icon: FaFacebook,
    iconColor: "text-blue-500",
    backgroundColor: "bg-blue-500/10",
  },

  rtmp: {
    label: "Custom RTMP",
    icon: Radio,
    iconColor: "text-slate-400",
    backgroundColor: "bg-slate-500/10",
  },
};

/* =========================================================
   STATUS CONFIGURATION
   ========================================================= */

const destinationStatusConfig = {
  disabled: {
    label: "Disabled",
    icon: AlertCircle,
    className:
      "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },

  pending: {
    label: "Ready",
    icon: CheckCircle2,
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },

  ready: {
    label: "Ready",
    icon: CheckCircle2,
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },

  configured: {
    label: "Configured",
    icon: CheckCircle2,
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },

  needs_configuration: {
    label: "Needs Configuration",
    icon: AlertCircle,
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },

  connecting: {
    label: "Connecting",
    icon: Clock,
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },

  connected: {
    label: "Connected",
    icon: CheckCircle2,
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },

  failed: {
    label: "Failed",
    icon: AlertCircle,
    className:
      "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

/* =========================================================
   HELPERS
   ========================================================= */

function getPlatformConfig(platform) {
  const normalizedPlatform = String(platform || "")
    .toLowerCase()
    .trim();

  return (
    platformConfig[normalizedPlatform] ||
    platformConfig.rtmp
  );
}

function getDestinationStatus(destination) {
  const status = String(destination.status || "")
    .toLowerCase()
    .trim();

  if (status === "disabled") {
    return "disabled";
  }

  if (status === "connected") {
    return "connected";
  }

  if (status === "connecting") {
    return "connecting";
  }

  if (status === "reconnecting") {
    return "connecting";
  }

  if (status === "failed") {
    return "failed";
  }

  if (status === "ready") {
    return "ready";
  }

  if (status === "configured") {
    return "configured";
  }

  if (status === "pending") {
    return "pending";
  }

  if (!destination.streamUrl || !destination.streamKey) {
    return "needs_configuration";
  }

  return "ready";
}

function getDestinationDisplayStatus(destination) {
  const status = getDestinationStatus(destination);

  return (
    destinationStatusConfig[status] ||
    destinationStatusConfig.needs_configuration
  );
}

/* =========================================================
   STATUS BADGE
   ========================================================= */

function DestinationStatusBadge({ destination }) {
  const statusConfig =
    getDestinationDisplayStatus(destination);

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
   DESTINATION FORM MODAL
   ========================================================= */

function DestinationModal({
  destination,
  onClose,
  onSave,
  loading,
}) {
  const isEditing = Boolean(destination);

  const [name, setName] = useState(
    destination?.name || ""
  );

  const [platform, setPlatform] = useState(
    destination?.platform || "youtube"
  );

  const [streamUrl, setStreamUrl] = useState(
    destination?.streamUrl || ""
  );

  const [streamKey, setStreamKey] = useState("");

  const [showStreamKey, setShowStreamKey] =
    useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Destination name is required.");
      return;
    }

    if (!streamUrl.trim()) {
      setError("Server URL is required.");
      return;
    }

    if (!isEditing && !streamKey.trim()) {
      setError("Stream Key is required.");
      return;
    }

    const payload = {
      name: name.trim(),
      platform,
      streamUrl: streamUrl.trim(),
    };

    /*
     * When editing:
     * Stream Key is optional.
     * Empty input means preserve the existing key.
     */
    if (streamKey.trim()) {
      payload.streamKey = streamKey.trim();
    }

    /*
     * New destination status
     */
    if (!isEditing) {
      payload.status = "pending";
    }

    try {
      await onSave(payload);
    } catch (err) {
      setError(err.message || "Failed to save destination.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151e] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-5">

          <div>
            <h2 className="text-base font-semibold text-white">
              {isEditing
                ? "Edit Destination"
                : "Add Destination"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditing
                ? "Update your destination configuration"
                : "Add a new streaming destination"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
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

          {/* Destination Name */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Destination Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="My YouTube Channel"
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Platform
            </label>

            <select
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value)
              }
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
            >
              <option value="youtube">YouTube</option>
              <option value="twitch">Twitch</option>
              <option value="facebook">Facebook</option>
              <option value="rtmp">Custom RTMP</option>
            </select>
          </div>

          {/* Server URL */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Server URL
            </label>

            <input
              type="text"
              value={streamUrl}
              onChange={(event) =>
                setStreamUrl(event.target.value)
              }
              placeholder="rtmp://server.example.com/live"
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
            />
          </div>

          {/* Stream Key */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Stream Key
            </label>

            <div className="relative">
              <input
                type={showStreamKey ? "text" : "password"}
                value={streamKey}
                onChange={(event) =>
                  setStreamKey(event.target.value)
                }
                placeholder={
                  isEditing
                    ? "Leave blank to keep existing Stream Key"
                    : "Enter Stream Key"
                }
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-[#1c1c27] px-3 py-2.5 pr-12 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowStreamKey((previous) => !previous)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                title={
                  showStreamKey
                    ? "Hide Stream Key"
                    : "Show Stream Key"
                }
              >
                <ExternalLink size={15} />
              </button>
            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              {isEditing
                ? "Stream Key is hidden. Leave this field empty to keep the current key."
                : "Stream Key will be stored securely in your backend configuration."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Notice */}
          <div className="rounded-lg border border-violet-500/10 bg-violet-500/5 p-3">
            <p className="text-xs leading-relaxed text-slate-400">
              Destination configuration is saved to the MultiStream backend.
              Streaming connection status is monitored separately by the streaming engine.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />

                  {isEditing
                    ? "Save Changes"
                    : "Add Destination"}
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

/* =========================================================
   DESTINATION CARD
   ========================================================= */

function DestinationCard({
  destination,
  onEdit,
  onDelete,
}) {
  const config = getPlatformConfig(
    destination.platform
  );

  const DestinationIcon = config.icon;

  const [menuOpen, setMenuOpen] = useState(false);

  const status = getDestinationStatus(destination);

  return (
    <div className="group rounded-xl border border-white/5 bg-[#15151e] p-4 transition-all duration-200 hover:border-white/10 hover:bg-[#191923]">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          {/* Platform Icon */}
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.backgroundColor}`}
          >
            <DestinationIcon
              className={config.iconColor}
              size={22}
            />
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {destination.name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {config.label}
            </p>
          </div>

        </div>

        {/* Menu */}
        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
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
                  onEdit(destination);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <Settings2 size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete(destination);
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
          destination={destination}
        />

        {status === "connected" && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </div>
        )}

      </div>

      {/* Destination Configuration */}
      <div className="mt-4 space-y-3 border-t border-white/5 pt-4">

        {/* Server URL */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Server URL
          </p>

          <p className="mt-1 break-all rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs text-slate-300">
            {destination.streamUrl || "Not configured"}
          </p>
        </div>

        {/* Stream Key */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Stream Key
          </p>

          <p className="mt-1 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs text-slate-300">
            {destination.streamKey
              ? "••••••••••••••••"
              : "Not configured"}
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">

        <button
          type="button"
          onClick={() => onEdit(destination)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
        >
          <Pencil size={14} />
          Edit Destination
        </button>

        <button
          type="button"
          onClick={() => onDelete(destination)}
          className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-slate-400 transition hover:bg-red-500/5 hover:text-red-400"
          aria-label={`Delete ${destination.name}`}
        >
          <Trash2 size={14} />
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   DESTINATION LIST
   ========================================================= */

function DestinationList() {
  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedDestination, setSelectedDestination] =
    useState(null);

  /* =========================================================
     FETCH DESTINATIONS
     ========================================================= */

  const fetchDestinations = async () => {
    try {
      setError("");

      const response = await api.getDestinations();

      const destinationData = response.data;

      if (!Array.isArray(destinationData)) {
        throw new Error(
          "Invalid destination data received from server."
        );
      }

      setDestinations(destinationData);
    } catch (err) {
      console.error(
        "[DestinationList] Failed to fetch destinations:",
        err
      );

      setError(
        err.message || "Failed to load destinations."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL FETCH
     ========================================================= */

  useEffect(() => {
    fetchDestinations();
  }, []);

  /* =========================================================
     SUMMARY
     ========================================================= */

  const disabledDestinations = destinations.filter(
    (destination) =>
      getDestinationStatus(destination) === "disabled"
  );

  const readyDestinations = destinations.filter(
    (destination) =>
      ["ready", "pending", "configured"].includes(
        getDestinationStatus(destination)
      )
  );

  const needsConfigurationDestinations =
    destinations.filter(
      (destination) =>
        getDestinationStatus(destination) ===
        "needs_configuration"
    );

  const totalDestinations = destinations.length;

  /* =========================================================
     ADD / UPDATE DESTINATION
     ========================================================= */

  const handleSaveDestination = async (payload) => {
    setSaving(true);

    try {
      if (selectedDestination) {
        await api.updateDestination(
          selectedDestination.id,
          payload
        );
      } else {
        await api.createDestination(payload);
      }

      await fetchDestinations();

      setModalOpen(false);

      setSelectedDestination(null);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     OPEN ADD MODAL
     ========================================================= */

  const handleAdd = () => {
    setSelectedDestination(null);
    setModalOpen(true);
  };

  /* =========================================================
     OPEN EDIT MODAL
     ========================================================= */

  const handleEdit = (destination) => {
    setSelectedDestination(destination);
    setModalOpen(true);
  };

  /* =========================================================
     DELETE DESTINATION
     ========================================================= */

  const handleDelete = async (destination) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${destination.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.deleteDestination(destination.id);

      await fetchDestinations();
    } catch (err) {
      console.error(
        "[DestinationList] Delete failed:",
        err
      );

      setError(
        err.message || "Failed to delete destination."
      );
    }
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
                {loading ? "..." : totalDestinations}
              </span>

            </div>

            <p className="mt-1 text-xs text-slate-500">
              Manage all your streaming platforms from one place
            </p>

          </div>

          {/* Header Actions */}
          <div className="flex gap-2">

            <button
              type="button"
              onClick={fetchDestinations}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
            >
              <Plus size={15} />

              Add Destination
            </button>

          </div>

        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 p-5 pb-0 sm:grid-cols-4">

          {/* Ready */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-emerald-400"
              />

              <span className="text-xs text-slate-500">
                Ready
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {readyDestinations.length}
            </p>

          </div>

          {/* Disabled */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">
              <AlertCircle
                size={15}
                className="text-slate-400"
              />

              <span className="text-xs text-slate-500">
                Disabled
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {disabledDestinations.length}
            </p>

          </div>

          {/* Needs Configuration */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">
              <Clock
                size={15}
                className="text-amber-400"
              />

              <span className="text-xs text-slate-500">
                Needs Configuration
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold text-white">
              {needsConfigurationDestinations.length}
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

        {/* Error */}
        {error && (
          <div className="mx-5 mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="text-xs text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 p-12">
            <Loader2
              size={20}
              className="animate-spin text-violet-400"
            />

            <p className="text-sm text-slate-400">
              Loading destinations...
            </p>
          </div>
        )}

        {/* Destination Cards */}
        {!loading && destinations.length > 0 && (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-2">

            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

          </div>
        )}

        {/* Empty State */}
        {!loading && destinations.length === 0 && !error && (
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
              onClick={handleAdd}
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
            Destination configuration is managed by the MultiStream backend.
          </p>

        </div>

      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => {
            setModalOpen(false);
            setSelectedDestination(null);
          }}
          onSave={handleSaveDestination}
          loading={saving}
        />
      )}
    </>
  );
}

export default DestinationList;