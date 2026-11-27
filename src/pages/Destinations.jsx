
import { useState, useEffect, useRef } from "react";

import {
  Plus,
  Radio,
  Globe,
  Pencil,
  Trash2,
  Power,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Search,
  Copy,
  RefreshCw,
  Settings,
  Signal,
  Activity,
  Server,
  ShieldCheck,
} from "lucide-react";

import {
  FaYoutube,
  FaTwitch,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

import { api } from "../services/api";

/* =====================================================
   PLATFORM CONFIGURATION
===================================================== */

const platformConfig = {
  youtube: {
    name: "YouTube",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: FaYoutube,
    serverUrl: "rtmp://a.rtmp.youtube.com/live2",
  },

  twitch: {
    name: "Twitch",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: FaTwitch,
    serverUrl: "rtmp://live.twitch.tv/app",
  },

  facebook: {
    name: "Facebook Live",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: FaFacebook,
    serverUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
  },

  instagram: {
    name: "Instagram",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    icon: FaInstagram,
    serverUrl: "",
  },

  tiktok: {
    name: "TikTok",
    color: "text-white",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: FaTiktok,
    serverUrl: "",
  },

  kick: {
    name: "Kick",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: Radio,
    serverUrl: "rtmp://example.com/live",
  },

  custom: {
    name: "Custom RTMP",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: Globe,
    serverUrl: "",
  },
};

/* =====================================================
   PROTOCOL CONFIGURATION
===================================================== */

const protocols = [
  {
    id: "RTMP",
    description: "Standard RTMP connection",
  },
  {
    id: "RTMPS",
    description: "Encrypted RTMP connection",
  },
  {
    id: "SRT",
    description: "Secure Reliable Transport",
  },
  {
    id: "WHIP",
    description: "WebRTC HTTP Ingestion Protocol",
  },
];

/* =====================================================
   DATA MAPPING
   BACKEND DATA -> FRONTEND DATA
===================================================== */

const mapDestination = (destination) => {
  const streamKey = destination.streamKey || "";

  const enabled = destination.status !== "disabled";

  const ready = streamKey.trim() !== "";

  return {
    id: destination.id,
    name: destination.name,
    platform: destination.platform,
    connectionMethod: destination.connectionMethod || "manual",

    serverUrl: destination.streamUrl || "",
    streamKey,

    enabled,
    ready,

    status: destination.status,
    createdAt: destination.createdAt,
  };
};

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ destination }) {
  if (!destination.enabled) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        Disabled
      </span>
    );
  }

  if (destination.ready) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Ready
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
      Not Configured
    </span>
  );
}

/* =====================================================
   DESTINATION CARD
===================================================== */

function DestinationCard({
  destination,
  onToggle,
  onEdit,
  onDelete,
}) {
  const config =
    platformConfig[destination.platform] ||
    platformConfig.custom;

  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-[#17171f] p-4 transition hover:border-white/20">

      {/* HEADER */}

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${config.bg} ${config.border}`}
          >
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              {destination.name}
            </h3>

            <p className="mt-0.5 text-xs text-zinc-500">
              {config.name}
            </p>
          </div>

        </div>

        <button
          onClick={() => onEdit(destination)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
          title="Edit destination"
        >
          <Pencil className="h-4 w-4" />
        </button>

      </div>

      {/* STATUS */}

      <div className="mt-4">
        <StatusBadge destination={destination} />
      </div>

      {/* SERVER URL */}

      <div className="mt-4">

        <label className="mb-1.5 block text-xs text-zinc-500">
          Server URL
        </label>

        <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">

          <p className="truncate text-xs text-zinc-400">
            {destination.serverUrl || "Not configured"}
          </p>

        </div>

      </div>

      {/* STREAM KEY */}

      <div className="mt-3">

        <label className="mb-1.5 block text-xs text-zinc-500">
          Stream Key
        </label>

        <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">

          <p className="text-xs text-zinc-400">
            {destination.streamKey
              ? "••••••••••••••••••••••"
              : "Not configured"}
          </p>

        </div>

      </div>

      {/* FOOTER */}

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">

        <button
          onClick={() => onToggle(destination)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
            destination.enabled
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
        >
          <Power className="h-4 w-4" />

          {destination.enabled ? "Enabled" : "Disabled"}
        </button>

        <div className="flex items-center gap-1">

          <button
            onClick={() => onEdit(destination)}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(destination.id)}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   ADD / EDIT DESTINATION MODAL
===================================================== */

function DestinationModal({
  destination,
  onClose,
  onSave,
  onAutomatic,
  saving,
}) {
  const [name, setName] = useState(
    destination?.name || ""
  );

  const [platform, setPlatform] = useState(
    destination?.platform || "youtube"
  );

  const [serverUrl, setServerUrl] = useState(
    destination?.serverUrl ||
      platformConfig.youtube.serverUrl
  );

  const [streamKey, setStreamKey] = useState(
    destination?.streamKey || ""
  );

  const [showKey, setShowKey] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState(
    destination?.connectionMethod || "manual"
  );

  /* CHANGE PLATFORM */

  const handlePlatformChange = (value) => {
    setPlatform(value);
    setConnectionMethod("manual");
    setServerUrl(platformConfig[value]?.serverUrl || "");
    setStreamKey("");
  };

  /* SUBMIT */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (connectionMethod === "automatic") {
      if (platform === "youtube") {
        onAutomatic?.();
      }
      return;
    }

    const destinationData = {
      name,
      platform,
      connectionMethod: "manual",
      streamUrl: serverUrl.trim(),
      streamKey: streamKey.trim(),

      status: streamKey.trim()
        ? "connected"
        : "pending",
    };

    await onSave(destinationData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#15151d] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 p-5">

          <div>
            <h2 className="text-lg font-semibold text-white">
              {destination
                ? "Edit Destination"
                : "Add Destination"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Configure your streaming platform
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >

          {/* NAME */}

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Destination Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: YouTube Gaming"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
            />

          </div>

          {/* PLATFORM */}

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Platform
            </label>

            <select
              value={platform}
              onChange={(e) =>
                handlePlatformChange(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#1c1c26] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
            >
              <option value="youtube">YouTube</option>
              <option value="twitch">Twitch</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="kick">Kick</option>
              <option value="custom">Custom RTMP</option>
            </select>

          </div>
          {/* CONNECTION METHOD */}

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Connection Method
            </label>

            {platform === "youtube" || platform === "facebook" ? (
              <div className="grid grid-cols-2 gap-3">
                {/* AUTOMATIC */}
                <button
                  type="button"
                  disabled={platform === "facebook"}
                  onClick={() => {
                    if (platform === "youtube") onAutomatic?.();
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    platform === "youtube"
                      ? "border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/15"
                      : "border-white/10 bg-white/[0.02] opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm font-medium text-white">Automatic</span>
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    {platform === "youtube" ? "YouTube Integration" : "Facebook Integration"}
                  </p>

                  <span className={`mt-3 inline-block rounded-full px-2 py-1 text-[10px] ${
                    platform === "youtube"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-white/5 text-zinc-500"
                  }`}>
                    {platform === "youtube" ? "Available" : "Coming Soon"}
                  </span>
                </button>

                {/* MANUAL */}
                <button
                  type="button"
                  onClick={() => setConnectionMethod("manual")}
                  className={`rounded-xl border p-4 text-left transition ${
                    connectionMethod === "manual"
                      ? "border-indigo-500/40 bg-indigo-500/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Server className={`h-5 w-5 ${connectionMethod === "manual" ? "text-indigo-400" : "text-zinc-400"}`} />
                    <span className="text-sm font-medium text-white">Manual</span>
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">RTMP Configuration</p>
                  <span className="mt-3 inline-block rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-400">Available</span>
                </button>
              </div>
            ) : (
              /* MANUAL-ONLY PLATFORMS */
              <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-400" />
                  <span className="text-sm font-medium text-white">Manual RTMP</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Configure your server URL and stream key.
                </p>
                <span className="mt-3 inline-block rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-400">Available</span>
              </div>
            )}
          </div>
          {/* SERVER URL */}

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Server URL
            </label>

            <input
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="rtmp://server-address/app"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
            />

          </div>

          {/* STREAM KEY */}

          <div>

            <label className="mb-2 block text-sm text-zinc-300">
              Stream Key
            </label>

            <div className="relative">

              <input
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                type={showKey ? "text" : "password"}
                placeholder="Enter your stream key"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-indigo-500/50"
              />

              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Keep your stream key private.
            </p>

          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Destination"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

/* =====================================================
   CREATE YOUTUBE LIVE MODAL
===================================================== */

function YouTubeLiveModal({ onClose, onCreate, creating }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState("unlisted");
  const [resolution, setResolution] = useState("1080p");
  const [fps, setFps] = useState("30fps");

  const handleSubmit = (event) => {
    event.preventDefault();

    // Open the loading tab directly from the user interaction
    // to prevent the browser from blocking the popup.
    const studioTab = window.open(
      `${window.location.origin}/?youtube-live-creating=1`,
      "_blank"
    );

    if (!studioTab) {
      window.alert(
        "Popup blocked. Please allow popups for MultiStream and try again."
      );
      return;
    }

    // Send the configuration to the parent only once.
    onCreate(
      {
        title: title.trim(),
        description,
        privacyStatus,
        resolution,
        fps,
      },
      studioTab
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!creating) onClose();
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#11111a] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <FaYoutube className="h-5 w-5 text-red-500" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Create YouTube Live
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Configure your live stream
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* TITLE */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Stream Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter your live stream title"
              required
              disabled={creating}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 disabled:opacity-50"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your live stream..."
              rows={4}
              disabled={creating}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 disabled:opacity-50"
            />
          </div>

          {/* PRIVACY */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Privacy
            </label>
            <select
              value={privacyStatus}
              onChange={(event) => setPrivacyStatus(event.target.value)}
              disabled={creating}
              className="w-full rounded-xl border border-white/10 bg-[#1c1c26] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 disabled:opacity-50"
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            <p className="mt-2 text-xs text-zinc-500">
              Choose who can watch your live stream.
            </p>
          </div>

          {/* VIDEO CONFIGURATION */}
          <div className="grid grid-cols-2 gap-4">
            {/* RESOLUTION */}
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(event) => setResolution(event.target.value)}
                disabled={creating}
                className="w-full rounded-xl border border-white/10 bg-[#1c1c26] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 disabled:opacity-50"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="1440p">1440p</option>
                <option value="2160p">2160p (4K)</option>
              </select>
            </div>

            {/* FPS */}
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Frame Rate
              </label>
              <select
                value={fps}
                onChange={(event) => setFps(event.target.value)}
                disabled={creating}
                className="w-full rounded-xl border border-white/10 bg-[#1c1c26] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 disabled:opacity-50"
              >
                <option value="30fps">30 FPS</option>
                <option value="60fps">60 FPS</option>
              </select>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating || !title.trim()}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaYoutube className="h-4 w-4" />
              {creating ? "Creating Live..." : "Create Live"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================
   DESTINATIONS PAGE
===================================================== */

 export default function Destinations() {
  const [destinations, setDestinations] = useState([]);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingDestination, setEditingDestination] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* YOUTUBE OAUTH CONNECTION */
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeConnectionLoading, setYoutubeConnectionLoading] = useState(true);
  const [youtubeActionLoading, setYoutubeActionLoading] = useState(false);
  const oauthPopupRef = useRef(null);
  const [youtubeLiveModalOpen, setYoutubeLiveModalOpen] = useState(false);
  const [creatingYoutubeLive, setCreatingYoutubeLive] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successLink, setSuccessLink] = useState("");

  /* ENCODER CONFIGURATION */

  const [protocol, setProtocol] = useState("RTMP");

  const [encoderUrl, setEncoderUrl] = useState(
    "rtmp://localhost:1935/live"
  );

  const [encoderKey, setEncoderKey] = useState("");

  const [showEncoderKey, setShowEncoderKey] =
    useState(false);

  const [copied, setCopied] = useState("");
  /* =====================================================
     FETCH DESTINATIONS
  ===================================================== */

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.getDestinations();

      const mappedDestinations = response.data.map(
        mapDestination
      );

      setDestinations(mappedDestinations);
    } catch (error) {
      console.error(
        "Failed to fetch destinations:",
        error
      );

      setError(
        error.message ||
          "Failed to connect to destination API"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     YOUTUBE OAUTH STATUS & ACTIONS
  ===================================================== */

  const fetchYouTubeConnectionStatus = async () => {
    try {
      const response = await fetch(
  "http://localhost:5000/api/oauth/status",
  {
    credentials: "include",
  }

);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to check YouTube connection.");
      }

      setYoutubeConnected(Boolean(result.connected));
      return Boolean(result.connected);
    } catch (error) {
      console.error("YouTube connection status error:", error);
      setYoutubeConnected(false);
      return false;
    } finally {
      setYoutubeConnectionLoading(false);
    }
  };

const connectYouTube = () => {
  setError("");

  const oauthTab = window.open(
    "http://localhost:5173/oauth/youtube/connecting",
    "_blank"
  );

  if (!oauthTab) {
    setError(
      "Browser blocked the OAuth tab. Please allow popups for MultiStream and try again."
    );
    return;
  }

  oauthPopupRef.current = oauthTab;

  setYoutubeActionLoading(true);
};

  const disconnectYouTube = async () => {
    const confirmed = window.confirm("Disconnect the YouTube account from MultiStream?");
    if (!confirmed) return;

    try {
      setYoutubeActionLoading(true);
      setError("");

     const response = await fetch(
  "http://localhost:5000/api/oauth/youtube",
  {
    method: "DELETE",
    credentials: "include",
  }
);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to disconnect YouTube.");
      }

      setYoutubeConnected(false);
    } catch (error) {
      console.error("YouTube disconnect error:", error);
      setError(error.message || "Failed to disconnect YouTube.");
    } finally {
      setYoutubeActionLoading(false);
    }
  };

  /* INITIAL FETCH + OAUTH STATUS CHECK */

  useEffect(() => {
    fetchDestinations();
    fetchYouTubeConnectionStatus();
  }, []);

  // Check status while the OAuth popup is open. The callback currently
  // displays JSON, so the parent page detects successful token storage.
  useEffect(() => {
    if (!youtubeActionLoading || !oauthPopupRef.current) return;

    const intervalId = setInterval(async () => {
      const connected = await fetchYouTubeConnectionStatus();

      if (connected) {
        if (oauthPopupRef.current && !oauthPopupRef.current.closed) {
          oauthPopupRef.current.close();
        }
        oauthPopupRef.current = null;
        setYoutubeActionLoading(false);
      } else if (!oauthPopupRef.current || oauthPopupRef.current.closed) {
        oauthPopupRef.current = null;
        setYoutubeActionLoading(false);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [youtubeActionLoading]);

  /* =====================================================
     CREATE YOUTUBE LIVE + AUTO-SAVE DESTINATION
  ===================================================== */

  const createYouTubeLive = async (configuration, studioTab) => {
  try {
    setCreatingYoutubeLive(true);
    setError("");
    setSuccessMessage("");
    setSuccessLink("");

    // Request ke backend untuk membuat YouTube Live
    const response = await fetch(
      "http://localhost:5000/api/youtube/live/configuration",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configuration),
      }
    );

    const result = await response.json();

    // Periksa apakah request berhasil
    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to create YouTube Live configuration."
      );
    }

    // Ambil URL Live Control Room dari broadcast yang baru dibuat
    const liveStudioUrl =
      result.data?.liveStudioUrl ||
      (result.data?.broadcast?.id
        ? `https://studio.youtube.com/video/${result.data.broadcast.id}/livestreaming`
        : "");

    const watchUrl = result.data?.watchUrl || "";

    // Pastikan URL Live Control Room tersedia
    if (!liveStudioUrl) {
      throw new Error(
        "YouTube Live berhasil dibuat, tetapi Live Control Room URL tidak ditemukan."
      );
    }

    // Redirect tab loading ke Live Control Room broadcast baru
    if (studioTab && !studioTab.closed) {
      studioTab.location.replace(liveStudioUrl);
    }

    // Tutup modal setelah proses berhasil
    setYoutubeLiveModalOpen(false);

    // Refresh daftar destination
    await fetchDestinations();

    // Tampilkan pesan sukses
    setSuccessMessage(
      "YouTube Live berhasil dibuat dan destination tersimpan."
    );

    // Simpan link untuk tombol Open Live Control Room
    setSuccessLink(liveStudioUrl || watchUrl);

  } catch (error) {
    // Jika proses gagal, tutup tab loading
    if (studioTab && !studioTab.closed) {
      studioTab.close();
    }

    console.error("Create YouTube Live error:", error);

    setError(
      error.message || "Failed to create YouTube Live."
    );

  } finally {
    setCreatingYoutubeLive(false);
  }
};

  /* =====================================================
     GENERATE STREAM KEY
  ===================================================== */

  const generateStreamKey = () => {
    const randomPart = crypto.randomUUID()
      .replaceAll("-", "");

    const newKey = `multistream_${randomPart}`;

    setEncoderKey(newKey);
    setShowEncoderKey(true);
  };

  /* =====================================================
     COPY TO CLIPBOARD
  ===================================================== */

  const copyToClipboard = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(label);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);

      setError("Failed to copy to clipboard.");
    }
  };

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalCount = destinations.length;

  const activeCount = destinations.filter(
    (item) => item.enabled
  ).length;

  const readyCount = destinations.filter(
    (item) => item.enabled && item.ready
  ).length;

  const needsConfigurationCount =
    destinations.filter(
      (item) => item.enabled && !item.ready
    ).length;

  /* SEARCH */

  const filteredDestinations =
    destinations.filter((item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  /* =====================================================
     TOGGLE DESTINATION
  ===================================================== */

  const toggleDestination = async (destination) => {
    try {
      setError("");

      const newEnabled = !destination.enabled;

      const newStatus = newEnabled
        ? destination.streamKey
          ? "connected"
          : "pending"
        : "disabled";

      await api.updateDestination(
        destination.id,
        {
          status: newStatus,
        }
      );

      await fetchDestinations();
    } catch (error) {
      console.error(
        "Failed to update destination:",
        error
      );

      setError(
        error.message ||
          "Failed to update destination"
      );
    }
  };

  /* =====================================================
     DELETE DESTINATION
  ===================================================== */

  const deleteDestination = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this destination?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.deleteDestination(id);

      await fetchDestinations();
    } catch (error) {
      console.error(
        "Failed to delete destination:",
        error
      );

      setError(
        error.message ||
          "Failed to delete destination"
      );
    }
  };

  /* =====================================================
     SAVE DESTINATION
  ===================================================== */

  const saveDestination = async (data) => {
    try {
      setSaving(true);
      setError("");

      if (editingDestination) {
        await api.updateDestination(
          editingDestination.id,
          data
        );
      } else {
        await api.createDestination(data);
      }

      await fetchDestinations();

      setModalOpen(false);
      setEditingDestination(null);
    } catch (error) {
      console.error(
        "Failed to save destination:",
        error
      );

      setError(
        error.message ||
          "Failed to save destination"
      );
    } finally {
      setSaving(false);
    }
  };

  /* YOUTUBE AUTOMATIC FROM DESTINATION MODAL */

  const handleYouTubeAutomatic = () => {
    setModalOpen(false);
    setEditingDestination(null);

    if (youtubeConnected) {
      setYoutubeLiveModalOpen(true);
    } else {
      connectYouTube();
    }
  };

  /* OPEN ADD MODAL */

  const openAddModal = () => {
    setEditingDestination(null);
    setModalOpen(true);
  };

  /* OPEN EDIT MODAL */

  const openEditModal = (destination) => {
    setEditingDestination(destination);
    setModalOpen(true);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Destinations
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your streaming output and connected channels.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Add Channel
        </button>

      </div>

      {/* =================================================
          YOUTUBE ACCOUNT CONNECTION
      ================================================= */}

      <div className="rounded-2xl border border-white/10 bg-[#111118] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <FaYoutube className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">YouTube Account Connection</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Connect your Google account to prepare YouTube API integration.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                {youtubeConnectionLoading ? (
                  <span className="text-zinc-400">Checking connection...</span>
                ) : youtubeConnected ? (
                  <span className="inline-flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Account connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Not connected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {youtubeConnected ? (
              <button
                onClick={disconnectYouTube}
                disabled={youtubeActionLoading}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {youtubeActionLoading ? "Please wait..." : "Disconnect YouTube"}
              </button>
            ) : (
              <button
                onClick={connectYouTube}
                disabled={youtubeConnectionLoading || youtubeActionLoading}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                <FaYoutube className="h-4 w-4" />
                {youtubeActionLoading ? "Waiting for authorization..." : "Connect YouTube"}
              </button>
            )}
            {youtubeConnected && (
              <button
                onClick={() => setYoutubeLiveModalOpen(true)}
                disabled={youtubeActionLoading || creatingYoutubeLive}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                <FaYoutube className="h-4 w-4" />
                Create YouTube Live
              </button>
            )}

            <button
              onClick={fetchYouTubeConnectionStatus}
              disabled={youtubeConnectionLoading}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          SUCCESS NOTIFICATION
      ================================================= */}

      {successMessage && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-emerald-400">Berhasil</p>
            <p className="mt-1 text-sm text-emerald-300/80">{successMessage}</p>
            {successLink && (
              <a href={successLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-emerald-300 underline underline-offset-2">
                Buka YouTube Live Control Room
              </a>
            )}
          </div>
          <button onClick={() => { setSuccessMessage(""); setSuccessLink(""); }} className="text-emerald-400 hover:text-emerald-300" aria-label="Dismiss success message">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">
              Request Failed
            </p>

            <p className="mt-1 text-sm text-red-300/80">
              {error}
            </p>
          </div>

          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Total Channels
            </p>

            <Globe className="h-5 w-5 text-indigo-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {totalCount}
          </h2>
        </div>

        {/* ACTIVE */}

        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Active Channels
            </p>

            <Radio className="h-5 w-5 text-emerald-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {activeCount}
          </h2>
        </div>

        {/* READY */}

        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Ready to Stream
            </p>

            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {readyCount}
          </h2>
        </div>

        {/* CONFIGURATION */}

        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Needs Configuration
            </p>

            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {needsConfigurationCount}
          </h2>
        </div>

      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* =================================================
            ENCODER CONFIGURATION
        ================================================= */}

        <div className="xl:col-span-2">

          <div className="h-full rounded-2xl border border-white/10 bg-[#111118] p-5 sm:p-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Radio className="h-5 w-5 text-indigo-400" />
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Encoder Configuration
                  </h2>

                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Connect your encoder to MultiStream.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Server Ready
              </span>

            </div>

            {/* PROTOCOL TABS */}

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

              {protocols.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setProtocol(item.id)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    protocol === item.id
                      ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.id}
                </button>
              ))}

            </div>

            {/* PROTOCOL DESCRIPTION */}

            <p className="mt-3 text-xs text-zinc-500">
              {
                protocols.find(
                  (item) => item.id === protocol
                )?.description
              }
            </p>

            {/* SERVER URL */}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Server URL
              </label>

              <div className="flex gap-2">

                <div className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3">

                  <input
                    value={encoderUrl}
                    onChange={(e) =>
                      setEncoderUrl(e.target.value)
                    }
                    className="w-full bg-transparent text-sm text-zinc-300 outline-none"
                  />

                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      encoderUrl,
                      "url"
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                  <Copy className="h-4 w-4" />

                  <span className="hidden sm:inline">
                    {copied === "url"
                      ? "Copied"
                      : "Copy"}
                  </span>
                </button>

              </div>

            </div>

            {/* STREAM KEY */}

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between">

                <label className="text-sm font-medium text-zinc-300">
                  Stream Key
                </label>

                <button
                  onClick={generateStreamKey}
                  className="flex items-center gap-2 text-xs text-indigo-400 transition hover:text-indigo-300"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate Key
                </button>

              </div>

              <div className="flex gap-2">

                <div className="relative flex-1 rounded-xl border border-white/10 bg-black/20">

                  <input
                    value={encoderKey}
                    onChange={(e) =>
                      setEncoderKey(e.target.value)
                    }
                    type={
                      showEncoderKey
                        ? "text"
                        : "password"
                    }
                    placeholder="Generate a stream key first"
                    className="w-full bg-transparent px-4 py-3 pr-12 text-sm text-zinc-300 outline-none"
                  />

                  <button
                    onClick={() =>
                      setShowEncoderKey(
                        !showEncoderKey
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showEncoderKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

                <button
                  onClick={() =>
                    copyToClipboard(
                      encoderKey,
                      "key"
                    )
                  }
                  disabled={!encoderKey}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Copy className="h-4 w-4" />

                  <span className="hidden sm:inline">
                    {copied === "key"
                      ? "Copied"
                      : "Copy"}
                  </span>
                </button>

              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Your stream key is private. Never share it with anyone.
              </p>

            </div>

            {/* INFORMATION */}

            <div className="mt-6 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.04] p-4">

              <div className="flex items-start gap-3">

                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />

                <div>

                  <p className="text-sm font-medium text-zinc-300">
                    How to connect
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Copy the Server URL and Stream Key into your streaming software such as OBS Studio. Your incoming stream will later be processed and distributed to your selected channels.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            YOUR CHANNELS
        ================================================= */}

        <div className="xl:col-span-1">

          <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Your Channels
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Manage your streaming outputs
                </p>

              </div>

              <button
                onClick={openAddModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-600"
                title="Add Channel"
              >
                <Plus className="h-4 w-4" />
              </button>

            </div>

            {/* SEARCH */}

            <div className="relative mt-5">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search channels..."
                className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500/40"
              />

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="py-12 text-center">

                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />

                <p className="mt-3 text-sm text-zinc-500">
                  Loading channels...
                </p>

              </div>

            ) : filteredDestinations.length === 0 ? (

              /* EMPTY */

              <div className="py-12 text-center">

                <Globe className="mx-auto h-8 w-8 text-zinc-600" />

                <p className="mt-3 text-sm text-zinc-400">
                  No channels found
                </p>

                <button
                  onClick={openAddModal}
                  className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Add your first channel
                </button>

              </div>

            ) : (

              /* CHANNEL LIST */

              <div className="mt-4 space-y-3">

                {filteredDestinations.map(
                  (destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      onToggle={toggleDestination}
                      onEdit={openEditModal}
                      onDelete={deleteDestination}
                    />
                  )
                )}

              </div>

            )}

            {/* ADD CHANNEL BUTTON */}

            <button
              onClick={openAddModal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-sm text-zinc-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-400"
            >
              <Plus className="h-4 w-4" />
              Add Channel
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          FOOTER INFORMATION
      ================================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* ENCODING */}

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12151C] p-4">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
            <Server className="h-4 w-4 text-violet-400" />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-300">
              Encoding Architecture
            </p>

            <p className="mt-0.5 text-[10px] text-gray-500">
              Single encoder · Multi-output
            </p>
          </div>

        </div>

        {/* CONNECTION */}

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12151C] p-4">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
            <Signal className="h-4 w-4 text-blue-400" />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-300">
              Network Connection
            </p>

            <p className="mt-0.5 text-[10px] text-gray-500">
              Backend connection available
            </p>
          </div>

        </div>

        {/* SYSTEM */}

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12151C] p-4">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-300">
              System Health
            </p>

            <p className="mt-0.5 text-[10px] text-gray-500">
              Backend connected successfully
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {youtubeLiveModalOpen && (
        <YouTubeLiveModal
          onClose={() => {
            if (!creatingYoutubeLive) {
              setYoutubeLiveModalOpen(false);
            }
          }}
          onCreate={createYouTubeLive}
          creating={creatingYoutubeLive}
        />
      )}

      {modalOpen && (
        <DestinationModal
          destination={editingDestination}
          onClose={() => {
            if (!saving) {
              setModalOpen(false);
              setEditingDestination(null);
            }
          }}
          onSave={saveDestination}
          onAutomatic={handleYouTubeAutomatic}
          saving={saving}
        />
      )}

    </div>
  );
 }