import { useEffect, useState } from "react";

import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

/* =========================================================
   INITIAL CHART DATA
========================================================= */

const initialChartData = [
  { time: "20:00", cpu: 32, bandwidth: 12.4, bitrate: 8.2 },
  { time: "20:01", cpu: 29, bandwidth: 13.1, bitrate: 8.4 },
  { time: "20:02", cpu: 35, bandwidth: 14.2, bitrate: 8.1 },
  { time: "20:03", cpu: 31, bandwidth: 15.3, bitrate: 8.5 },
  { time: "20:04", cpu: 28, bandwidth: 14.8, bitrate: 8.3 },
  { time: "20:05", cpu: 26, bandwidth: 16.1, bitrate: 8.4 },
  { time: "20:06", cpu: 30, bandwidth: 17.2, bitrate: 8.2 },
  { time: "20:07", cpu: 27, bandwidth: 16.5, bitrate: 8.4 },
  { time: "20:08", cpu: 25, bandwidth: 17.8, bitrate: 8.3 },
  { time: "20:09", cpu: 24, bandwidth: 18.4, bitrate: 8.5 },
  { time: "20:10", cpu: 26, bandwidth: 18.1, bitrate: 8.4 },
  { time: "20:11", cpu: 23, bandwidth: 17.9, bitrate: 8.3 },
];

/* =========================================================
   CHART CONFIGURATION
========================================================= */

const chartRanges = [
  { label: "1M", dataLength: 5 },
  { label: "5M", dataLength: 10 },
  { label: "15M", dataLength: 15 },
  { label: "30M", dataLength: 20 },
];

const chartColors = {
  cpu: "#A78BFA",
  bandwidth: "#60A5FA",
  bitrate: "#34D399",
  background: "#12151C",
  grid: "#252932",
  text: "#6B7280",
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function generateNextMetric(previousValue, variation, minimum, maximum) {
  const nextValue = previousValue + (Math.random() * variation * 2 - variation);

  return Math.max(minimum, Math.min(maximum, nextValue));
}

function formatCurrentTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#151922] px-4 py-3 shadow-xl">
      <p className="mb-3 text-xs font-medium text-gray-400">
        {label}
      </p>

      {payload.map((metric) => (
        <div
          key={metric.dataKey}
          className="mb-1 flex items-center justify-between gap-5"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: metric.color,
              }}
            />

            <span className="text-xs text-gray-400">
              {metric.name}
            </span>
          </div>

          <span className="text-xs font-semibold text-white">
            {metric.value}
            {metric.dataKey === "cpu" ? "%" : " Mbps"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   METRIC CHANGE INDICATOR
========================================================= */

function MetricChange({ value, positiveColor = "text-emerald-400" }) {
  const isIncreasing = value > 0;
  const isNeutral = value === 0;

  if (isNeutral) {
    return (
      <span className="text-[10px] text-gray-400">
        Stable
      </span>
    );
  }

  const Icon = isIncreasing ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`flex items-center text-[10px] ${
        isIncreasing ? "text-amber-400" : positiveColor
      }`}
    >
      <Icon className="h-3 w-3" />

      {Math.abs(value).toFixed(1)}
    </span>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function StreamChart() {
  const [chartData, setChartData] = useState(initialChartData);
  const [selectedRange, setSelectedRange] = useState("5M");

  /* =======================================================
     REALTIME SIMULATION
  ======================================================= */

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setChartData((previousChartData) => {
        const latestMetrics =
          previousChartData[previousChartData.length - 1];

        if (!latestMetrics) {
          return previousChartData;
        }

        const nextCpuUsage = generateNextMetric(
          latestMetrics.cpu,
          3,
          10,
          60
        );

        const nextBandwidth = generateNextMetric(
          latestMetrics.bandwidth,
          1,
          5,
          30
        );

        const nextBitrate = generateNextMetric(
          latestMetrics.bitrate,
          0.2,
          7,
          10
        );

        const nextMetrics = {
          time: formatCurrentTime(),
          cpu: Number(nextCpuUsage.toFixed(1)),
          bandwidth: Number(nextBandwidth.toFixed(1)),
          bitrate: Number(nextBitrate.toFixed(1)),
        };

        return [
          ...previousChartData.slice(-19),
          nextMetrics,
        ];
      });
    }, 2000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  /* =======================================================
     RANGE FILTER
  ======================================================= */

  const selectedRangeConfig = chartRanges.find(
    (range) => range.label === selectedRange
  );

  const visibleDataLength =
    selectedRangeConfig?.dataLength ?? 10;

  const visibleChartData = chartData.slice(
    -visibleDataLength
  );

  /* =======================================================
     CURRENT METRICS
  ======================================================= */

  const latestMetrics =
    chartData[chartData.length - 1] ?? {
      cpu: 0,
      bandwidth: 0,
      bitrate: 0,
    };

  const previousMetrics =
    chartData[chartData.length - 2] ?? latestMetrics;

  const cpuChange =
    latestMetrics.cpu - previousMetrics.cpu;

  const bandwidthChange =
    latestMetrics.bandwidth - previousMetrics.bandwidth;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12151C]">

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">

        {/* Chart Title */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <Activity className="h-4 w-4 text-violet-400" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">
                Performance Overview
              </h3>

              <p className="mt-0.5 text-xs text-gray-500">
                Real-time streaming metrics
              </p>
            </div>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
          {chartRanges.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setSelectedRange(range.label)}
              className={`
                rounded-md px-3 py-1.5 text-xs font-medium
                transition-all duration-200
                ${
                  selectedRange === range.label
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-gray-500 hover:text-white"
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Summary */}
      <div className="grid grid-cols-1 gap-4 border-b border-white/[0.06] p-5 sm:grid-cols-3">

        {/* CPU */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />

            <span className="text-xs text-gray-500">
              CPU Usage
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              {latestMetrics.cpu}%
            </span>

            <MetricChange value={cpuChange} />
          </div>
        </div>

        {/* Bandwidth */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />

            <span className="text-xs text-gray-500">
              Upload Bandwidth
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              {latestMetrics.bandwidth} Mbps
            </span>

            <MetricChange
              value={bandwidthChange}
              positiveColor="text-blue-400"
            />
          </div>
        </div>

        {/* Bitrate */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs text-gray-500">
              Stream Bitrate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              {latestMetrics.bitrate} Mbps
            </span>

            <span className="text-[10px] text-emerald-400">
              Stable
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full p-4 sm:h-[340px] sm:p-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visibleChartData}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 5,
            }}
          >
            {/* Grid */}
            <CartesianGrid
              stroke={chartColors.grid}
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: chartColors.text,
                fontSize: 11,
              }}
              tickMargin={10}
              minTickGap={30}
            />

            {/* CPU Axis */}
            <YAxis
              yAxisId="cpu"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: chartColors.text,
                fontSize: 11,
              }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />

            {/* Network Axis */}
            <YAxis
              yAxisId="network"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: chartColors.text,
                fontSize: 11,
              }}
              tickFormatter={(value) => `${value}`}
              domain={[0, 30]}
            />

            {/* Tooltip */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#ffffff",
                strokeOpacity: 0.1,
              }}
            />

            {/* CPU Area */}
            <Area
              yAxisId="cpu"
              type="monotone"
              dataKey="cpu"
              stroke="none"
              fill={chartColors.cpu}
              fillOpacity={0.04}
              animationDuration={500}
            />

            {/* CPU Line */}
            <Line
              yAxisId="cpu"
              type="monotone"
              dataKey="cpu"
              name="CPU Usage"
              stroke={chartColors.cpu}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: chartColors.cpu,
                stroke: chartColors.background,
                strokeWidth: 2,
              }}
              animationDuration={500}
            />

            {/* Bandwidth Line */}
            <Line
              yAxisId="network"
              type="monotone"
              dataKey="bandwidth"
              name="Bandwidth"
              stroke={chartColors.bandwidth}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: chartColors.bandwidth,
                stroke: chartColors.background,
                strokeWidth: 2,
              }}
              animationDuration={500}
            />

            {/* Bitrate Line */}
            <Line
              yAxisId="network"
              type="monotone"
              dataKey="bitrate"
              name="Bitrate"
              stroke={chartColors.bitrate}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{
                r: 4,
                fill: chartColors.bitrate,
                stroke: chartColors.background,
                strokeWidth: 2,
              }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>

          <span className="text-[10px] text-gray-500">
            Live simulation
          </span>
        </div>

        <span className="text-[10px] text-gray-600">
          Updated every 2 seconds
        </span>
      </div>
    </div>
  );
}

export default StreamChart;