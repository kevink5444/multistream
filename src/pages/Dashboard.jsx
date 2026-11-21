import { useState, useEffect } from "react";

import {
  Cpu,
  Video,
  Radio,
  Zap,
  Play,
  Square,
  Activity,
  Wifi,
  ShieldCheck,
} from "lucide-react";

import StatCard from "../components/StatCard";
import StreamChart from "../components/StreamChart";
import DestinationList from "../components/DestinationList";
import ActivityList from "../components/ActivityList";

import { api } from "../services/api";

/* =========================================================
   DASHBOARD PAGE
   ========================================================= */

function Dashboard() {
  /* =======================================================
     STATE
     ======================================================= */

  const [streamingActive, setStreamingActive] = useState(false);

  const [cpuSaverEnabled, setCpuSaverEnabled] = useState(true);

  const [backendStatus, setBackendStatus] = useState("checking");

  const [forwarders, setForwarders] = useState([]);

  const [forwarderLoading, setForwarderLoading] = useState(true);

  const [forwarderError, setForwarderError] = useState(null);
  /* =======================================================
     BACKEND CONNECTION
     ======================================================= */

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.getStatus();

        if (response.success && response.status === "online") {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
        setBackendStatus("offline");
      }
    };

    checkBackend();
  }, []);
/* =======================================================
   FORWARDER STATUS MONITOR
   ======================================================= */

useEffect(() => {
  let isMounted = true;

  const fetchForwarderStatus = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/forwarders/status"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch forwarder status");
      }

      const result = await response.json();

      if (isMounted && result.success) {
        setForwarders(result.data || []);
        setForwarderError(null);
      }
    } catch (error) {
      if (isMounted) {
        setForwarderError(error.message);
      }
    } finally {
      if (isMounted) {
        setForwarderLoading(false);
      }
    }
  };

  fetchForwarderStatus();

  const interval = setInterval(fetchForwarderStatus, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, []);



  /* =======================================================
     STREAM HANDLERS
     ======================================================= */

  const handleStartStream = () => {
    setStreamingActive(true);
  };

  const handleStopStream = () => {
    setStreamingActive(false);
  };

  const handleToggleCpuSaver = () => {
    setCpuSaverEnabled((previousState) => !previousState);
  };
/* =======================================================
   FORWARDER STATISTICS
   ======================================================= */

  const connectedForwarders = forwarders.filter(
  (item) => item.status?.toLowerCase() === "connected"
  ).length;

  const reconnectingForwarders = forwarders.filter(
  (item) => item.status?.toLowerCase() === "reconnecting"
  ).length;

  const failedForwarders = forwarders.filter(
  (item) => item.status?.toLowerCase() === "failed"
  ).length;

  const totalForwarders = forwarders.length;
  /* =======================================================
     DASHBOARD STATISTICS
     ======================================================= */

  const dashboardStats = [
    {
      title: "CPU Usage",
      value: streamingActive ? "24.8%" : "12.4%",
      description: "System processor utilization",
      trend: streamingActive ? "+3.2%" : "-2.1%",
      trendType: streamingActive ? "warning" : "positive",
      icon: Cpu,
      accent: "violet",
      footer: "Optimal performance",
    },

    {
      title: "Encoding",
      value: streamingActive ? "Active" : "Idle",
      description: streamingActive
        ? "1 encoding process running"
        : "No active encoding process",
      trend: streamingActive ? "Running" : "Stopped",
      trendType: streamingActive ? "positive" : "neutral",
      icon: Video,
      accent: "blue",
      footer: streamingActive
        ? "H.264 · 1080p 60 FPS"
        : "Ready to start",
    },

   {
    title: "Destinations",
    value: `${connectedForwarders} / ${totalForwarders}`,
    description: "Connected streaming platforms",
    trend:
    totalForwarders > 0
      ? `${Math.round(
          (connectedForwarders / totalForwarders) * 100
        )}%`
      : "0%",
    trendType:
    connectedForwarders === totalForwarders &&
    totalForwarders > 0
      ? "positive"
      : "warning",
    icon: Radio,
    accent: "emerald",
    footer: `${connectedForwarders} connected · ${failedForwarders} failed`,
},

    {
      title: "CPU Savings",
      value: cpuSaverEnabled ? "68%" : "0%",
      description: "Estimated CPU reduction",
      trend: cpuSaverEnabled ? "Optimized" : "Disabled",
      trendType: cpuSaverEnabled ? "positive" : "neutral",
      icon: Zap,
      accent: "amber",
      footer: cpuSaverEnabled
        ? "Single encoding architecture"
        : "Optimization disabled",
    },
  ];

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Page Title */}
        <div>
          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard
            </h1>

            <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] font-medium text-violet-400">
              OVERVIEW
            </span>

          </div>

          <p className="mt-1 text-sm text-gray-500">
            Monitor your streaming performance and destinations.
          </p>
        </div>

        {/* Stream Controls */}
        <div className="flex flex-wrap items-center gap-3">

          {/* CPU Saver Toggle */}
          <button
            type="button"
            onClick={handleToggleCpuSaver}
            aria-pressed={cpuSaverEnabled}
            className={`
              flex items-center gap-2 rounded-xl border px-3 py-2.5
              text-sm font-medium transition-all
              ${
                cpuSaverEnabled
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15"
                  : "border-white/[0.08] bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]"
              }
            `}
          >

            <Zap className="h-4 w-4" />

            <span>CPU Saver</span>

            <span
              className={`
                h-2 w-2 rounded-full
                ${
                  cpuSaverEnabled
                    ? "bg-amber-400"
                    : "bg-gray-600"
                }
              `}
            />

          </button>

          {/* Start Stream Button */}
          {!streamingActive ? (
            <button
              type="button"
              onClick={handleStartStream}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >

              <Play className="h-4 w-4 fill-current" />

              Start Stream

            </button>
          ) : (

            /* Stop Stream Button */
            <button
              type="button"
              onClick={handleStopStream}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/15"
            >

              <Square className="h-4 w-4 fill-current" />

              Stop Stream

            </button>
          )}

        </div>

      </div>

      {/* ===================================================
          STREAM STATUS
      =================================================== */}

      <div
        className={`
          flex flex-col gap-3 rounded-xl border p-4
          sm:flex-row sm:items-center sm:justify-between
          ${
            streamingActive
              ? "border-emerald-500/15 bg-emerald-500/[0.04]"
              : "border-white/[0.06] bg-[#12151C]"
          }
        `}
      >

        {/* Stream Status Information */}
        <div className="flex items-center gap-3">

          {/* Status Icon */}
          <div
            className={`
              flex h-10 w-10 items-center justify-center rounded-xl
              ${
                streamingActive
                  ? "bg-emerald-500/10"
                  : "bg-white/[0.04]"
              }
            `}
          >

            {streamingActive ? (
              <Radio className="h-5 w-5 text-emerald-400" />
            ) : (
              <Activity className="h-5 w-5 text-gray-500" />
            )}

          </div>

          {/* Status Description */}
          <div>

            <p className="text-sm font-semibold text-white">
              {streamingActive
                ? "Stream is running"
                : "Stream is currently inactive"}
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              {streamingActive
                ? "Your stream is being distributed to connected destinations."
                : "Configure your destinations and start streaming when ready."}
            </p>

          </div>

        </div>

        {/* Stream Status Badge */}
        <div
          className={`
            flex w-fit items-center gap-2 rounded-lg px-3 py-1.5
            ${
              streamingActive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-white/[0.04] text-gray-500"
            }
          `}
        >

          {/* Status Indicator */}
          <span
            className={`
              h-2 w-2 rounded-full
              ${
                streamingActive
                  ? "animate-pulse bg-emerald-400"
                  : "bg-gray-500"
              }
            `}
          />

          <span className="text-xs font-medium">
            {streamingActive ? "LIVE" : "OFFLINE"}
          </span>

        </div>

      </div>
      {/* ===================================================
    FORWARDER MONITORING
=================================================== */}

<div className="rounded-xl border border-white/[0.06] bg-[#12151C] p-5">

  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <h2 className="text-sm font-semibold text-white">
        Forwarder Monitoring
      </h2>

      <p className="mt-1 text-xs text-gray-500">
        Real-time FFmpeg destination status
      </p>
    </div>

    <div className="flex flex-wrap gap-2">

      <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
        {connectedForwarders} Connected
      </span>

      {reconnectingForwarders > 0 && (
        <span className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
          {reconnectingForwarders} Reconnecting
        </span>
      )}

      {failedForwarders > 0 && (
        <span className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
          {failedForwarders} Failed
        </span>
      )}

    </div>

  </div>

  {forwarderLoading ? (

    <div className="py-8 text-center text-sm text-gray-500">
      Loading forwarder status...
    </div>

  ) : forwarderError ? (

    <div className="rounded-lg border border-red-500/10 bg-red-500/[0.04] p-4">
      <p className="text-sm text-red-400">
        Unable to retrieve forwarder status
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {forwarderError}
      </p>
    </div>

  ) : forwarders.length === 0 ? (

    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-6 text-center">

      <Activity className="mx-auto mb-3 h-8 w-8 text-gray-600" />

      <p className="text-sm text-gray-400">
        No active forwarders
      </p>

      <p className="mt-1 text-xs text-gray-600">
        Start streaming from OBS to activate destinations.
      </p>

    </div>

  ) : (

    <div className="space-y-3">

      {forwarders.map((forwarder) => {

        const status = forwarder.status?.toLowerCase();

        const statusConfig = {
          connected: {
            label: "CONNECTED",
            color: "text-emerald-400",
            background: "bg-emerald-500/10",
            dot: "bg-emerald-400",
          },

          reconnecting: {
            label: "RECONNECTING",
            color: "text-amber-400",
            background: "bg-amber-500/10",
            dot: "bg-amber-400 animate-pulse",
          },

          failed: {
            label: "FAILED",
            color: "text-red-400",
            background: "bg-red-500/10",
            dot: "bg-red-400",
          },

          stopped: {
            label: "STOPPED",
            color: "text-gray-400",
            background: "bg-gray-500/10",
            dot: "bg-gray-500",
          },

          starting: {
            label: "STARTING",
            color: "text-blue-400",
            background: "bg-blue-500/10",
            dot: "bg-blue-400 animate-pulse",
          },
        };

        const config = statusConfig[status] || {
          label: status?.toUpperCase() || "UNKNOWN",
          color: "text-gray-400",
          background: "bg-gray-500/10",
          dot: "bg-gray-500",
        };

        return (
          <div
            key={forwarder.destinationId}
            className="flex flex-col gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
          >

            {/* Destination Info */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Radio className="h-5 w-5 text-red-400" />
              </div>

              <div>

                <p className="text-sm font-medium text-white">
                  {forwarder.destinationName || forwarder.platform}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {forwarder.platform?.toUpperCase() || "PLATFORM"}
                </p>

              </div>

            </div>

            {/* Status */}
            <div className="flex flex-wrap items-center gap-3">

              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${config.background}`}
              >

                <span
                  className={`h-2 w-2 rounded-full ${config.dot}`}
                />

                <span className={`text-xs font-semibold ${config.color}`}>
                  {config.label}
                </span>

              </div>

              {forwarder.lastError && status === "failed" && (
                <p className="max-w-xs truncate text-xs text-red-400">
                  {forwarder.lastError}
                </p>
              )}

            </div>

          </div>
        );
      })}

    </div>

  )}

    <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">

    <p className="text-[10px] text-gray-500">
      Automatic refresh every 3 seconds
    </p>

    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      Live monitoring
    </span>

  </div>

  </div>          
      {/* ===================================================
          STATISTICS CARDS
      =================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            trend={stat.trend}
            trendType={stat.trendType}
            icon={stat.icon}
            accent={stat.accent}
            footer={stat.footer}
          />
        ))}

      </div>

      {/* ===================================================
          MAIN DASHBOARD CONTENT
      =================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* Performance Chart */}
        <div className="xl:col-span-2">
          <StreamChart />
        </div>

        {/* Streaming Destinations */}
        <div className="xl:col-span-1">
          <DestinationList />
        </div>

      </div>

      {/* ===================================================
          ACTIVITY LOG
      =================================================== */}

      <div className="grid grid-cols-1 gap-5">

        <ActivityList />

      </div>

      {/* ===================================================
          SYSTEM INFORMATION
      =================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* Encoding Architecture */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12151C] p-4">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">

            <Cpu className="h-4 w-4 text-violet-400" />

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

        {/* Network Connection */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12151C] p-4">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">

            <Wifi className="h-4 w-4 text-blue-400" />

          </div>

          <div>

            <p className="text-xs font-medium text-gray-300">
              Network Connection
            </p>

            <p className="mt-0.5 text-[10px] text-gray-500">
              Stable connection
            </p>

          </div>

        </div>

        {/* System Health */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12151C] p-4">

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              backendStatus === "online"
                ? "bg-emerald-500/10"
                : backendStatus === "offline"
                  ? "bg-red-500/10"
                  : "bg-gray-500/10"
            }`}
          >

            <ShieldCheck
              className={`h-4 w-4 ${
                backendStatus === "online"
                  ? "text-emerald-400"
                  : backendStatus === "offline"
                    ? "text-red-400"
                    : "text-gray-400"
              }`}
            />

          </div>

          <div>

            <p className="text-xs font-medium text-gray-300">
              System Health
            </p>

            <p className="mt-0.5 text-[10px] text-gray-500">
              {backendStatus === "checking"
                ? "Checking backend connection..."
                : backendStatus === "online"
                  ? "Backend connected successfully"
                  : "Backend connection unavailable"}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EXPORT
   ========================================================= */

export default Dashboard;