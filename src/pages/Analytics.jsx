
import { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  MemoryStick,
  Gauge,
  Radio,
  TrendingUp,
  TrendingDown,
  Clock,
  Monitor,
  Signal,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ======================================================
// MOCK DATA
// ======================================================

const initialChartData = Array.from({ length: 20 }, (_, index) => ({
  time: `${String(index).padStart(2, "0")}:00`,
  bitrate: 4500 + Math.floor(Math.random() * 1000),
  fps: 55 + Math.floor(Math.random() * 6),
  cpu: 25 + Math.floor(Math.random() * 20),
  memory: 40 + Math.floor(Math.random() * 15),
}));

// ======================================================
// CUSTOM TOOLTIP
// ======================================================

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#171720] p-3 shadow-xl">
      <p className="mb-2 text-xs text-zinc-400">
        {label}
      </p>

      {payload.map((item, index) => (
        <div
          key={index}
          className="mb-1 flex items-center justify-between gap-4"
        >
          <span className="text-xs text-zinc-400">
            {item.name}
          </span>

          <span className="text-xs font-semibold text-white">
            {item.value}
            {item.name === "FPS" || item.name === "CPU" || item.name === "Memory"
              ? "%"
              : " kbps"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function AnalyticsCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  color,
  trend,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] p-5 transition hover:border-white/20">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {title}
          </p>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {value}
            </span>

            <span className="text-sm text-zinc-500">
              {unit}
            </span>
          </div>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color.bg}`}
        >
          <Icon className={`h-5 w-5 ${color.text}`} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {subtitle}
        </p>

        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend.positive
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {trend.positive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}

            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// CHART CARD
// ======================================================

function ChartCard({
  title,
  subtitle,
  children,
  headerRight,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            {subtitle}
          </p>
        </div>

        {headerRight}
      </div>

      <div className="h-[280px] w-full">
        {children}
      </div>
    </div>
  );
}

// ======================================================
// RESOURCE CHART
// ======================================================

function ResourceChart({ data }) {
  return (
    <ChartCard
      title="System Resource Usage"
      subtitle="CPU and memory utilization over time"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id="cpuGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#818cf8"
                stopOpacity={0.3}
              />

              <stop
                offset="100%"
                stopColor="#818cf8"
                stopOpacity={0}
              />
            </linearGradient>

            <linearGradient
              id="memoryGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#34d399"
                stopOpacity={0.2}
              />

              <stop
                offset="100%"
                stopColor="#34d399"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#27272f"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            domain={[0, 100]}
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="cpu"
            name="CPU"
            stroke="#818cf8"
            strokeWidth={2}
            fill="url(#cpuGradient)"
          />

          <Area
            type="monotone"
            dataKey="memory"
            name="Memory"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#memoryGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ======================================================
// BITRATE CHART
// ======================================================

function BitrateChart({ data }) {
  return (
    <ChartCard
      title="Streaming Bitrate"
      subtitle="Outgoing bitrate performance"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id="bitrateGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#38bdf8"
                stopOpacity={0.3}
              />

              <stop
                offset="100%"
                stopColor="#38bdf8"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#27272f"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000} Mbps`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="bitrate"
            name="Bitrate"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#bitrateGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ======================================================
// FPS CHART
// ======================================================

function FPSChart({ data }) {
  return (
    <ChartCard
      title="Stream FPS"
      subtitle="Frames per second performance"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            stroke="#27272f"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            domain={[0, 60]}
            stroke="#71717a"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="fps"
            name="FPS"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ======================================================
// STREAM OVERVIEW
// ======================================================

function StreamOverview({ liveStreams }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">

      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold text-white">
          Stream Overview
        </h3>

        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
          Monitoring
        </span>
      </div>

      <div className="space-y-4">

        {/* Live Streams */}
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-red-400" />

            <div>
              <p className="text-sm text-white">
                Active Streams
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Currently broadcasting
              </p>
            </div>
          </div>

          <span className="text-2xl font-bold text-white">
            {liveStreams}
          </span>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-400" />

            <div>
              <p className="text-sm text-white">
                Total Uptime
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Current session
              </p>
            </div>
          </div>

          <span className="font-mono text-lg font-bold text-white">
            02:45:18
          </span>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <Signal className="h-5 w-5 text-emerald-400" />

            <div>
              <p className="text-sm text-white">
                Network Status
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Connection health
              </p>
            </div>
          </div>

          <span className="text-sm font-medium text-emerald-400">
            Excellent
          </span>
        </div>

        {/* Resolution */}
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-sky-400" />

            <div>
              <p className="text-sm text-white">
                Output Resolution
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Video configuration
              </p>
            </div>
          </div>

          <span className="text-sm font-medium text-white">
            1920 × 1080
          </span>
        </div>

      </div>
    </div>
  );
}

// ======================================================
// ANALYTICS PAGE
// ======================================================

export default function Analytics() {
  const [chartData, setChartData] = useState(initialChartData);

  const [cpu, setCpu] = useState(32);
  const [memory, setMemory] = useState(48);
  const [bitrate, setBitrate] = useState(5200);
  const [fps, setFps] = useState(60);

  const [liveStreams] = useState(2);

  // Simulate metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      const newCpu = Math.max(
        10,
        Math.min(90, cpu + Math.floor(Math.random() * 9 - 4))
      );

      const newMemory = Math.max(
        20,
        Math.min(90, memory + Math.floor(Math.random() * 7 - 3))
      );

      const newBitrate = Math.max(
        2500,
        Math.min(8000, bitrate + Math.floor(Math.random() * 500 - 250))
      );

      const newFps = Math.max(
        45,
        Math.min(60, fps + Math.floor(Math.random() * 3 - 1))
      );

      setCpu(newCpu);
      setMemory(newMemory);
      setBitrate(newBitrate);
      setFps(newFps);

      setChartData((prev) => {
        const nextData = [
          ...prev.slice(1),
          {
            time: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            cpu: newCpu,
            memory: newMemory,
            bitrate: newBitrate,
            fps: newFps,
          },
        ];

        return nextData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [cpu, memory, bitrate, fps]);

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-white">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Monitor your streaming performance and system resources.
        </p>
      </div>

      {/* ================================================== */}
      {/* STAT CARDS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <AnalyticsCard
          title="CPU Usage"
          value={cpu}
          unit="%"
          subtitle="Processor utilization"
          icon={Cpu}
          color={{
            bg: "bg-indigo-500/10",
            text: "text-indigo-400",
          }}
          trend={{
            positive: true,
            value: "Stable",
          }}
        />

        <AnalyticsCard
          title="Memory Usage"
          value={memory}
          unit="%"
          subtitle="System memory"
          icon={MemoryStick}
          color={{
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
          }}
          trend={{
            positive: true,
            value: "Normal",
          }}
        />

        <AnalyticsCard
          title="Bitrate"
          value={(bitrate / 1000).toFixed(2)}
          unit="Mbps"
          subtitle="Outgoing stream"
          icon={Activity}
          color={{
            bg: "bg-sky-500/10",
            text: "text-sky-400",
          }}
          trend={{
            positive: true,
            value: "Stable",
          }}
        />

        <AnalyticsCard
          title="FPS"
          value={fps}
          unit="fps"
          subtitle="Video frame rate"
          icon={Gauge}
          color={{
            bg: "bg-yellow-500/10",
            text: "text-yellow-400",
          }}
          trend={{
            positive: true,
            value: "Smooth",
          }}
        />

      </div>

      {/* ================================================== */}
      {/* CHARTS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        <ResourceChart data={chartData} />

        <BitrateChart data={chartData} />

        <FPSChart data={chartData} />

        <StreamOverview liveStreams={liveStreams} />

      </div>

      {/* ================================================== */}
      {/* FOOTER INFO */}
      {/* ================================================== */}

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-[#111118] p-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Analytics Monitoring Active
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Metrics are simulated and refreshed every 2 seconds.
            </p>
          </div>
        </div>

        <span className="text-xs text-zinc-500">
          Last update: {new Date().toLocaleTimeString()}
        </span>

      </div>

    </div>
  );
}
