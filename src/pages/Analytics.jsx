
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Radio,
  Signal,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

import { api } from "../services/api";

// ======================================================
// HELPERS
// ======================================================

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return "—";
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(remainingSeconds).padStart(2, "0"),
  ].join(":");
}

function getUptime(connectedAt, now) {
  if (!connectedAt) return null;

  const startTime = new Date(connectedAt).getTime();

  if (Number.isNaN(startTime)) return null;

  return Math.max(0, Math.floor((now - startTime) / 1000));
}

function getStatusConfig(status) {
  switch (status?.toLowerCase()) {
    case "connected":
      return {
        label: "Connected",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        dot: "bg-emerald-400",
      };

    case "connecting":
      return {
        label: "Connecting",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        dot: "bg-yellow-400",
      };

    case "reconnecting":
      return {
        label: "Reconnecting",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        dot: "bg-orange-400",
      };

    case "failed":
      return {
        label: "Failed",
        color: "text-red-400",
        bg: "bg-red-500/10",
        dot: "bg-red-400",
      };

    case "stopping":
      return {
        label: "Stopping",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        dot: "bg-orange-400",
      };

    case "stopped":
      return {
        label: "Stopped",
        color: "text-zinc-400",
        bg: "bg-zinc-500/10",
        dot: "bg-zinc-500",
      };

    default:
      return {
        label: status || "Unknown",
        color: "text-zinc-400",
        bg: "bg-zinc-500/10",
        dot: "bg-zinc-500",
      };
  }
}

// ======================================================
// OVERVIEW ITEM
// ======================================================

function OverviewItem({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  value,
  valueColor = "text-white",
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />

        <div className="min-w-0">
          <p className="text-sm font-medium text-white">
            {title}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {subtitle}
          </p>
        </div>
      </div>

      <span
        className={`shrink-0 text-right text-lg font-bold ${valueColor}`}
      >
        {value}
      </span>
    </div>
  );
}

// ======================================================
// DESTINATION STATUS ITEM
// ======================================================

function DestinationStatus({ forwarder, now }) {
  const statusConfig = getStatusConfig(forwarder.status);

  const uptime = getUptime(forwarder.connectedAt, now);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${statusConfig.bg}`}
        >
          <Radio className={`h-4 w-4 ${statusConfig.color}`} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {forwarder.destinationName ||
              forwarder.platform ||
              forwarder.destinationId ||
              forwarder.streamId}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {forwarder.platform || "Unknown platform"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        {uptime !== null && forwarder.status === "connected" && (
          <span className="font-mono text-xs text-zinc-400">
            {formatDuration(uptime)}
          </span>
        )}

        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${statusConfig.bg} ${statusConfig.color}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
          />

          {statusConfig.label}
        </span>
      </div>

      {forwarder.lastError && (
        <div className="flex w-full items-start gap-2 rounded-lg bg-red-500/5 px-3 py-2 text-xs text-red-400 sm:basis-full">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

          <span className="break-words">
            {forwarder.lastError}
          </span>
        </div>
      )}
    </div>
  );
}

// ======================================================
// STREAM OVERVIEW
// ======================================================

function StreamOverview({
  forwarders,
  activeCount,
  now,
}) {
  const connectedForwarders = forwarders.filter(
    (item) => item.status === "connected"
  );

  const connectingForwarders = forwarders.filter(
    (item) =>
      item.status === "connecting" ||
      item.status === "reconnecting"
  );

  const failedForwarders = forwarders.filter(
    (item) => item.status === "failed"
  );

  const stoppedForwarders = forwarders.filter(
    (item) => item.status === "stopped"
  );

  const hasConnections = connectedForwarders.length > 0;

  let networkStatus = "Offline";
let networkColor = "text-zinc-400";

if (activeCount === 0) {
  networkStatus = "Offline";
  networkColor = "text-zinc-400";
} else if (connectedForwarders.length >= activeCount) {
  networkStatus = "All Connected";
  networkColor = "text-emerald-400";
} else if (connectedForwarders.length > 0) {
  networkStatus = "Partial Connection";
  networkColor = "text-yellow-400";
} else if (connectingForwarders.length > 0) {
  networkStatus = "Connecting";
  networkColor = "text-yellow-400";
} else if (failedForwarders.length > 0) {
  networkStatus = "Connection Failed";
  networkColor = "text-red-400";
}

  // Uptime terlama dari forwarder yang sedang connected.
  const connectedTimes = connectedForwarders
    .map((item) => {
      if (!item.connectedAt) return null;

      const timestamp = new Date(item.connectedAt).getTime();

      return Number.isNaN(timestamp) ? null : timestamp;
    })
    .filter((timestamp) => timestamp !== null);

  const earliestConnectedAt =
    connectedTimes.length > 0
      ? Math.min(...connectedTimes)
      : null;

  const longestUptime =
    earliestConnectedAt !== null
      ? Math.max(0, Math.floor((now - earliestConnectedAt) / 1000))
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">
          Stream Overview
        </h3>

        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live Data
        </span>
      </div>

      {/* Overview Metrics */}
      <div className="space-y-4">
        <OverviewItem
          icon={Radio}
          iconColor="text-red-400"
          title="Active Forwarders"
          subtitle="Active FFmpeg processes"
          value={activeCount}
        />

        <OverviewItem
          icon={Clock}
          iconColor="text-indigo-400"
          title="Longest Uptime"
          subtitle="Connected forwarder"
          value={formatDuration(longestUptime)}
        />

        <OverviewItem
          icon={Signal}
          iconColor="text-emerald-400"
          title="Network Status"
          subtitle={`${connectedForwarders.length} of ${forwarders.length} connected`}
          value={networkStatus}
          valueColor={networkColor}
        />
      </div>

      {/* Destination Status */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">
            Destination Status
          </h4>

          <span className="text-xs text-zinc-500">
            {forwarders.length} total
          </span>
        </div>

        {forwarders.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-black/20 p-6 text-center">
            <Circle className="mx-auto mb-2 h-5 w-5 text-zinc-600" />

            <p className="text-sm text-zinc-400">
              No forwarder data available
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Start a streaming session to see its status here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {forwarders.map((forwarder, index) => (
              <DestinationStatus
                key={
                  forwarder.streamId ||
                  forwarder.destinationId ||
                  index
                }
                forwarder={forwarder}
                now={now}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// ANALYTICS PAGE
// ======================================================

export default function Analytics() {
  const [forwarders, setForwarders] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);
  const [now, setNow] = useState(Date.now());

  // ====================================================
  // FETCH ACTUAL BACKEND DATA
  // ====================================================

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.getForwarderStatuses();

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to retrieve forwarder data"
        );
      }

      setForwarders(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setActiveCount(
        typeof response.active === "number"
          ? response.active
          : 0
      );

      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.message || "Unable to connect to the backend"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ====================================================
  // INITIAL FETCH + POLLING
  // ====================================================

  useEffect(() => {
    fetchAnalytics();

    const pollingInterval = setInterval(() => {
      fetchAnalytics();
    }, 5000);

    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchAnalytics]);

  // ====================================================
  // UPTIME CLOCK
  // ====================================================

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Monitor your active streaming connections.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}

          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

          <div>
            <p className="text-sm font-medium text-red-400">
              Analytics API Error
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Initial Loading */}
      {loading && forwarders.length === 0 && !error ? (
        <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-white/10 bg-[#111118]">
          <div className="text-center">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-violet-400" />

            <p className="text-sm text-zinc-400">
              Loading streaming data...
            </p>
          </div>
        </div>
      ) : (
        /* Stream Overview */
        <div className="grid grid-cols-1 gap-4">
          <StreamOverview
            forwarders={forwarders}
            activeCount={activeCount}
            now={now}
          />
        </div>
      )}

      {/* Monitoring Footer */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-[#111118] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Forwarder Monitoring
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Data is retrieved from the MultiStream backend.
              Refreshes every 5 seconds.
            </p>
          </div>
        </div>

        <span className="text-xs text-zinc-500">
          {lastUpdated
            ? `Last update: ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for data"}
        </span>
      </div>
    </div>
  );
}
