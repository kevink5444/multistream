import { useState, useEffect } from "react";

import {
  Radio,
  Activity,
  Wifi,
  ShieldCheck,
} from "lucide-react";

import StatCard from "../components/StatCard";
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

  const [backendStatus, setBackendStatus] = useState("checking");

  const [destinations, setDestinations] = useState([]);

  const [forwarders, setForwarders] = useState([]);

  const [destinationLoading, setDestinationLoading] = useState(true);

  const [forwarderLoading, setForwarderLoading] = useState(true);

  const [destinationError, setDestinationError] = useState(null);

  const [forwarderError, setForwarderError] = useState(null);

  /* =======================================================
     BACKEND CONNECTION
     ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const response = await api.getStatus();

        if (!isMounted) return;

        if (response.success && response.status === "online") {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
        if (isMounted) {
          setBackendStatus("offline");
        }
      }
    };

    checkBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     DESTINATION MONITOR
     ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchDestinations = async () => {
      try {
        const response = await api.getDestinations();

        if (!isMounted) return;

        if (response.success) {
          setDestinations(
            Array.isArray(response.data)
              ? response.data
              : []
          );

          setDestinationError(null);
        } else {
          throw new Error(
            response.message || "Failed to fetch destinations"
          );
        }
      } catch (error) {
        if (isMounted) {
          setDestinationError(error.message);
        }
      } finally {
        if (isMounted) {
          setDestinationLoading(false);
        }
      }
    };

    fetchDestinations();

    const interval = setInterval(fetchDestinations, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     FORWARDER STATUS MONITOR
     ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchForwarderStatus = async () => {
      try {
        const response = await api.getForwarderStatuses();

        if (!isMounted) return;

        if (response.success) {
          setForwarders(
            Array.isArray(response.data)
              ? response.data
              : []
          );

          setForwarderError(null);
        } else {
          throw new Error(
            response.message || "Failed to fetch forwarder status"
          );
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

  /* =======================================================
     DESTINATION STATISTICS
     ======================================================= */

  const totalDestinations = destinations.length;

  const connectionPercentage =
    totalDestinations > 0
      ? Math.round(
          (connectedForwarders / totalDestinations) * 100
        )
      : 0;

  /* =======================================================
     DASHBOARD STATISTICS
     ======================================================= */

  const dashboardStats = [
    {
      title: "Destinations",
      value: totalDestinations,
      description: "Total configured destinations",
      trend: `${connectedForwarders} connected`,
      trendType: connectedForwarders > 0 ? "positive" : "neutral",
      icon: Radio,
      accent: "violet",
      footer: "Configured destinations",
    },

    {
      title: "Connected",
      value: connectedForwarders,
      description: "Active streaming destinations",
      trend: `${connectionPercentage}% connection rate`,
      trendType: connectedForwarders > 0 ? "positive" : "neutral",
      icon: Radio,
      accent: "emerald",
      footer: "Successfully connected",
    },

    {
      title: "Reconnecting",
      value: reconnectingForwarders,
      description: "Destinations reconnecting",
      trend:
        reconnectingForwarders > 0
          ? "Connection retry"
          : "No reconnecting",
      trendType: reconnectingForwarders > 0 ? "warning" : "neutral",
      icon: Activity,
      accent: "amber",
      footer: "Automatic reconnection",
    },

    {
      title: "Failed",
      value: failedForwarders,
      description: "Failed streaming destinations",
      trend:
        failedForwarders > 0
          ? "Requires attention"
          : "All systems normal",
      trendType: failedForwarders > 0 ? "warning" : "positive",
      icon: Activity,
      accent: "red",
      footer: "Destination connection status",
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
            Monitor your streaming destinations and system status.
          </p>
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
          FORWARDER MONITORING
      =================================================== */}

      <div className="rounded-xl border border-white/[0.06] bg-[#12151C] p-5">

        {/* Header */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-sm font-semibold text-white">
              Forwarder Monitoring
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Real-time FFmpeg destination status
            </p>
          </div>

          {/* Status Summary */}

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

        {/* Loading */}

        {forwarderLoading ? (

          <div className="py-8 text-center text-sm text-gray-500">
            Loading forwarder status...
          </div>

        ) : forwarderError ? (

          /* Error */

          <div className="rounded-lg border border-red-500/10 bg-red-500/[0.04] p-4">

            <p className="text-sm text-red-400">
              Unable to retrieve forwarder status
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {forwarderError}
            </p>

          </div>

        ) : forwarders.length === 0 ? (

          /* Empty State */

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

          /* Forwarder List */

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

                  {/* Destination Information */}

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

                    {/* Error */}

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

        {/* Monitoring Footer */}

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
          MAIN DASHBOARD CONTENT
      =================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Streaming Destinations */}

        <div>
          <DestinationList />
        </div>

        {/* Activity Log */}

        <div>
          <ActivityList />
        </div>

      </div>

      {/* ===================================================
          SYSTEM INFORMATION
      =================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* Streaming Architecture */}

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#12151C] p-4">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">

            <Radio className="h-4 w-4 text-violet-400" />

          </div>

          <div>

            <p className="text-xs font-medium text-gray-300">
              Streaming Architecture
            </p>

            <p className="mt-0.5 text-[10px] text-gray-500">
              Single input · Multi-output
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
              Connection status monitored
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