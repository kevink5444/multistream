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
      value: "3 / 4",
      description: "Connected streaming platforms",
      trend: "75%",
      trendType: "positive",
      icon: Radio,
      accent: "emerald",
      footer: "3 connected · 1 pending",
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