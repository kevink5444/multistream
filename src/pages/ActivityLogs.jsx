
import { useState } from "react";
import {
  Activity,
  Search,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Radio,
  Monitor,
  Globe,
  Settings,
  Clock,
  Filter,
} from "lucide-react";

// ======================================================
// MOCK ACTIVITY DATA
// ======================================================

const initialLogs = [
  {
    id: 1,
    type: "success",
    category: "Streaming",
    message: "Streaming session started successfully",
    detail: "Gaming Stream is now broadcasting to YouTube Gaming and Twitch Main.",
    time: "21:45:32",
    date: "Today",
  },
  {
    id: 2,
    type: "info",
    category: "Source",
    message: "Desktop Capture source enabled",
    detail: "Desktop Capture is ready for streaming.",
    time: "21:44:18",
    date: "Today",
  },
  {
    id: 3,
    type: "success",
    category: "Destination",
    message: "YouTube Gaming destination configured",
    detail: "Destination configuration saved successfully.",
    time: "21:42:05",
    date: "Today",
  },
  {
    id: 4,
    type: "warning",
    category: "System",
    message: "CPU usage is above normal",
    detail: "CPU usage reached 78%. Consider reducing encoding quality.",
    time: "21:38:44",
    date: "Today",
  },
  {
    id: 5,
    type: "success",
    category: "Streaming",
    message: "Streaming session stopped",
    detail: "Camera Live session stopped successfully.",
    time: "21:30:12",
    date: "Today",
  },
  {
    id: 6,
    type: "info",
    category: "Source",
    message: "Main Camera source added",
    detail: "New camera source was added to the system.",
    time: "21:25:09",
    date: "Today",
  },
  {
    id: 7,
    type: "error",
    category: "Destination",
    message: "Destination connection failed",
    detail: "Unable to establish connection to Facebook Live.",
    time: "21:18:51",
    date: "Today",
  },
  {
    id: 8,
    type: "success",
    category: "System",
    message: "Application initialized",
    detail: "MultiStream application started successfully.",
    time: "21:00:00",
    date: "Today",
  },
  {
    id: 9,
    type: "info",
    category: "Settings",
    message: "Streaming configuration updated",
    detail: "Output resolution changed to 1920 × 1080.",
    time: "20:58:22",
    date: "Today",
  },
  {
    id: 10,
    type: "warning",
    category: "Streaming",
    message: "Bitrate fluctuation detected",
    detail: "Outgoing bitrate temporarily dropped below target.",
    time: "20:45:11",
    date: "Today",
  },
];

// ======================================================
// LOG CONFIGURATION
// ======================================================

const logTypeConfig = {
  success: {
    label: "Success",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },

  warning: {
    label: "Warning",
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },

  error: {
    label: "Error",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },

  info: {
    label: "Info",
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

// ======================================================
// CATEGORY ICON
// ======================================================

function CategoryIcon({ category }) {
  const icons = {
    Streaming: Radio,
    Source: Monitor,
    Destination: Globe,
    System: Settings,
    Settings: Settings,
  };

  const Icon = icons[category] || Activity;

  return <Icon className="h-4 w-4" />;
}

// ======================================================
// LOG ITEM
// ======================================================

function LogItem({ log }) {
  const config = logTypeConfig[log.type];
  const Icon = config.icon;

  return (
    <div className="group flex gap-4 border-b border-white/5 p-4 transition hover:bg-white/[0.02] sm:p-5">

      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.bg} ${config.border}`}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-white">
                {log.message}
              </h3>

              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.border} ${config.color}`}
              >
                {config.label}
              </span>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              {log.detail}
            </p>
          </div>

          {/* Time */}
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />

            <span>
              {log.date} · {log.time}
            </span>
          </div>

        </div>

        {/* Category */}
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <CategoryIcon category={log.category} />

          <span>{log.category}</span>
        </div>

      </div>

    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function LogStatCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {title}
        </p>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.bg}`}>
          <Icon className={`h-5 w-5 ${color.text}`} />
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-bold text-white">
        {value}
      </h2>

    </div>
  );
}

// ======================================================
// ACTIVITY LOGS PAGE
// ======================================================

export default function ActivityLogs() {
  const [logs, setLogs] = useState(initialLogs);

  const [search, setSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("all");

  const [selectedCategory, setSelectedCategory] = useState("all");

  // ====================================================
  // STATISTICS
  // ====================================================

  const totalLogs = logs.length;

  const successCount = logs.filter(
    (log) => log.type === "success"
  ).length;

  const warningCount = logs.filter(
    (log) => log.type === "warning"
  ).length;

  const errorCount = logs.filter(
    (log) => log.type === "error"
  ).length;

  // ====================================================
  // FILTER
  // ====================================================

  const filteredLogs = logs.filter((log) => {
    const matchesType =
      selectedFilter === "all" ||
      log.type === selectedFilter;

    const matchesCategory =
      selectedCategory === "all" ||
      log.category === selectedCategory;

    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.category.toLowerCase().includes(search.toLowerCase());

    return (
      matchesType &&
      matchesCategory &&
      matchesSearch
    );
  });

  // ====================================================
  // CLEAR LOGS
  // ====================================================

  const clearLogs = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all activity logs?"
    );

    if (!confirmed) return;

    setLogs([]);
  };

  // ====================================================
  // EXPORT LOGS
  // ====================================================

  const exportLogs = () => {
    if (logs.length === 0) {
      alert("There are no logs to export.");
      return;
    }

    const headers = [
      "Date",
      "Time",
      "Type",
      "Category",
      "Message",
      "Detail",
    ];

    const rows = logs.map((log) => [
      log.date,
      log.time,
      log.type,
      log.category,
      log.message,
      log.detail,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "multistream-activity-logs.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  // ====================================================
  // RESET FILTERS
  // ====================================================

  const resetFilters = () => {
    setSearch("");
    setSelectedFilter("all");
    setSelectedCategory("all");
  };

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Activity Logs
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Monitor application activities, events, and errors.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={exportLogs}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111118] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={clearLogs}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Clear Logs
          </button>

        </div>

      </div>

      {/* ================================================== */}
      {/* STATISTICS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <LogStatCard
          title="Total Events"
          value={totalLogs}
          icon={Activity}
          color={{
            bg: "bg-indigo-500/10",
            text: "text-indigo-400",
          }}
        />

        <LogStatCard
          title="Successful Events"
          value={successCount}
          icon={CheckCircle2}
          color={{
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
          }}
        />

        <LogStatCard
          title="Warnings"
          value={warningCount}
          icon={AlertTriangle}
          color={{
            bg: "bg-yellow-500/10",
            text: "text-yellow-400",
          }}
        />

        <LogStatCard
          title="Errors"
          value={errorCount}
          icon={XCircle}
          color={{
            bg: "bg-red-500/10",
            text: "text-red-400",
          }}
        />

      </div>

      {/* ================================================== */}
      {/* FILTERS */}
      {/* ================================================== */}

      <div className="rounded-2xl border border-white/10 bg-[#111118] p-4">

        <div className="flex flex-col gap-4">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity logs..."
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-500/50"
            />
          </div>

          {/* Type Filter */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-500" />

              <span className="text-xs text-zinc-500">
                Filter by status
              </span>
            </div>

            <div className="flex flex-wrap gap-2">

              {[
                { id: "all", label: "All Events" },
                { id: "success", label: "Success" },
                { id: "info", label: "Info" },
                { id: "warning", label: "Warnings" },
                { id: "error", label: "Errors" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    selectedFilter === filter.id
                      ? "bg-indigo-500 text-white"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}

            </div>
          </div>

          {/* Category Filter */}
          <div>
            <p className="mb-2 text-xs text-zinc-500">
              Filter by category
            </p>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1a1a22] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 sm:w-auto"
            >
              <option value="all">All Categories</option>
              <option value="Streaming">Streaming</option>
              <option value="Source">Source</option>
              <option value="Destination">Destination</option>
              <option value="System">System</option>
              <option value="Settings">Settings</option>
            </select>
          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* LOG LIST */}
      {/* ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">

        {/* List Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="font-semibold text-white">
              Event History
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Showing {filteredLogs.length} of {logs.length} events
            </p>
          </div>

          {(search || selectedFilter !== "all" || selectedCategory !== "all") && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-400 transition hover:text-indigo-300"
            >
              Reset Filters
            </button>
          )}

        </div>

        {/* Logs */}
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center">

            <Activity className="mx-auto h-10 w-10 text-zinc-600" />

            <h3 className="mt-4 font-semibold text-white">
              No activity found
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              No logs match your current filters.
            </p>

            <button
              onClick={resetFilters}
              className="mt-4 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm text-indigo-400 transition hover:bg-indigo-500/20"
            >
              Reset Filters
            </button>

          </div>
        ) : (
          <div>
            {filteredLogs.map((log) => (
              <LogItem
                key={log.id}
                log={log}
              />
            ))}
          </div>
        )}

      </div>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111118] p-4">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
          <Activity className="h-4 w-4 text-indigo-400" />
        </div>

        <div>
          <p className="text-sm font-medium text-white">
            Activity Monitoring
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Logs currently use simulated frontend data.
          </p>
        </div>

      </div>

    </div>
  );
}
