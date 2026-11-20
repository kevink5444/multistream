import { useState } from "react";

import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio,
  Cpu,
  Video,
  Clock,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   ACTIVITY DATA
========================================================= */

const initialActivities = [
  {
    id: 1,
    type: "success",
    category: "stream",
    title: "Stream started successfully",
    description:
      "Your live stream is now running with a single encoding process.",
    time: "Just now",
    timestamp: "20:11:42",
    destination: "MultiStream Engine",
  },
  {
    id: 2,
    type: "success",
    category: "destination",
    title: "YouTube Live connected",
    description:
      "Connection established successfully. Stream data is being transmitted.",
    time: "2 minutes ago",
    timestamp: "20:09:38",
    destination: "YouTube Live",
  },
  {
    id: 3,
    type: "success",
    category: "destination",
    title: "Twitch connected",
    description:
      "Twitch destination is receiving the encoded stream.",
    time: "3 minutes ago",
    timestamp: "20:08:21",
    destination: "Twitch",
  },
  {
    id: 4,
    type: "warning",
    category: "system",
    title: "Facebook Live connection pending",
    description:
      "Waiting for destination server to establish a connection.",
    time: "5 minutes ago",
    timestamp: "20:06:14",
    destination: "Facebook Live",
  },
  {
    id: 5,
    type: "success",
    category: "system",
    title: "CPU Saver mode enabled",
    description:
      "Encoding configuration optimized for multi-destination streaming.",
    time: "8 minutes ago",
    timestamp: "20:03:55",
    destination: "System",
  },
  {
    id: 6,
    type: "info",
    category: "encoding",
    title: "Encoding process initialized",
    description:
      "H.264 video encoding engine initialized at 1080p 60 FPS.",
    time: "10 minutes ago",
    timestamp: "20:01:12",
    destination: "FFmpeg",
  },
  {
    id: 7,
    type: "warning",
    category: "destination",
    title: "Custom RTMP disconnected",
    description:
      "Destination is currently offline. Stream distribution continues to other destinations.",
    time: "12 minutes ago",
    timestamp: "19:59:40",
    destination: "Custom RTMP",
  },
];

/* =========================================================
   ACTIVITY STATUS CONFIGURATION
========================================================= */

const activityStatusConfig = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    iconBackground: "bg-emerald-500/10",
    badgeColor: "text-emerald-400",
    badgeBackground: "bg-emerald-500/10",
    label: "Success",
  },

  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    iconBackground: "bg-amber-500/10",
    badgeColor: "text-amber-400",
    badgeBackground: "bg-amber-500/10",
    label: "Warning",
  },

  error: {
    icon: XCircle,
    iconColor: "text-red-400",
    iconBackground: "bg-red-500/10",
    badgeColor: "text-red-400",
    badgeBackground: "bg-red-500/10",
    label: "Error",
  },

  info: {
    icon: Activity,
    iconColor: "text-blue-400",
    iconBackground: "bg-blue-500/10",
    badgeColor: "text-blue-400",
    badgeBackground: "bg-blue-500/10",
    label: "Info",
  },
};

/* =========================================================
   ACTIVITY CATEGORY CONFIGURATION
========================================================= */

const activityCategoryIcons = {
  stream: Radio,
  destination: Video,
  encoding: Cpu,
  system: Activity,
};

/* =========================================================
   ACTIVITY FILTER CONFIGURATION
========================================================= */

const activityFilters = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Success",
    value: "success",
  },
  {
    label: "Warnings",
    value: "warning",
  },
  {
    label: "Errors",
    value: "error",
  },
];

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({ activity }) {
  const statusConfig =
    activityStatusConfig[activity.type] ??
    activityStatusConfig.info;

  const StatusIcon = statusConfig.icon;

  const CategoryIcon =
    activityCategoryIcons[activity.category] ?? Activity;

  return (
    <div className="group flex gap-3 py-4">

      {/* Status Icon */}
      <div
        className={`
          relative flex h-10 w-10 shrink-0 items-center justify-center
          rounded-xl
          ${statusConfig.iconBackground}
        `}
      >
        <StatusIcon
          className={`h-[18px] w-[18px] ${statusConfig.iconColor}`}
        />
      </div>

      {/* Activity Content */}
      <div className="min-w-0 flex-1">

        {/* Title and Status */}
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-medium text-gray-200">
            {activity.title}
          </h4>

          <span
            className={`
              rounded-md px-1.5 py-0.5
              text-[9px] font-semibold uppercase tracking-wide
              ${statusConfig.badgeBackground}
              ${statusConfig.badgeColor}
            `}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Description */}
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {activity.description}
        </p>

        {/* Metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-3">

          {/* Relative Time */}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-600" />

            <span className="text-[10px] text-gray-600">
              {activity.time}
            </span>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-1">
            <CategoryIcon className="h-3 w-3 text-gray-600" />

            <span className="text-[10px] text-gray-600">
              {activity.destination}
            </span>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="hidden shrink-0 pt-1 sm:block">
        <span className="text-[10px] text-gray-600">
          {activity.timestamp}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITY SUMMARY
========================================================= */

function ActivitySummary({ activityCounts }) {
  const summaryItems = [
    {
      label: "Success",
      value: activityCounts.success,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      label: "Warnings",
      value: activityCounts.warning,
      icon: AlertTriangle,
      color: "text-amber-400",
    },
    {
      label: "Errors",
      value: activityCounts.error,
      icon: XCircle,
      color: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-3 border-b border-white/[0.04]">
      {summaryItems.map((item, index) => {
        const SummaryIcon = item.icon;

        return (
          <div
            key={item.label}
            className={`
              px-4 py-3
              ${index !== 2 ? "border-r border-white/[0.04]" : ""}
            `}
          >
            <div className="flex items-center gap-1.5">
              <SummaryIcon
                className={`h-3.5 w-3.5 ${item.color}`}
              />

              <span className="text-[10px] text-gray-500">
                {item.label}
              </span>
            </div>

            <p className="mt-1 text-lg font-semibold text-white">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   ACTIVITY FILTER
========================================================= */

function ActivityFilter({
  selectedFilter,
  onFilterChange,
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.04] px-4 py-3">
      {activityFilters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onFilterChange(filter.value)}
          className={`
            shrink-0 rounded-lg px-3 py-1.5
            text-xs font-medium transition-all
            ${
              selectedFilter === filter.value
                ? "bg-white/[0.06] text-white"
                : "text-gray-500 hover:bg-white/[0.03] hover:text-gray-300"
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03]">
        <Activity className="h-5 w-5 text-gray-600" />
      </div>

      <p className="text-sm font-medium text-gray-400">
        No activities found
      </p>

      <p className="mt-1 text-xs text-gray-600">
        There are no activities in this category.
      </p>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function ActivityList() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAllActivities, setShowAllActivities] = useState(false);

  /* =======================================================
     ACTIVITY COUNTS
  ======================================================= */

  const activityCounts = initialActivities.reduce(
    (counts, activity) => {
      counts[activity.type] = (counts[activity.type] ?? 0) + 1;

      return counts;
    },
    {
      success: 0,
      warning: 0,
      error: 0,
      info: 0,
    }
  );

  /* =======================================================
     FILTER ACTIVITIES
  ======================================================= */

  const filteredActivities =
    selectedFilter === "all"
      ? initialActivities
      : initialActivities.filter(
          (activity) => activity.type === selectedFilter
        );

  /* =======================================================
     VISIBLE ACTIVITIES
  ======================================================= */

  const visibleActivities = showAllActivities
    ? filteredActivities
    : filteredActivities.slice(0, 5);

  /* =======================================================
     FILTER HANDLER
  ======================================================= */

  function handleFilterChange(filterValue) {
    setSelectedFilter(filterValue);
    setShowAllActivities(false);
  }

  /* =======================================================
     VIEW ALL HANDLER
  ======================================================= */

  function handleToggleActivities() {
    setShowAllActivities((previousState) => !previousState);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12151C]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] p-5">

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Activity Log
            </h3>

            <p className="mt-0.5 text-xs text-gray-500">
              Recent system activities
            </p>
          </div>
        </div>

        {/* Options */}
        <button
          type="button"
          onClick={() => handleFilterChange("all")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.04] hover:text-white"
          aria-label="Reset activity filter"
          title="Reset activity filter"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Summary */}
      <ActivitySummary activityCounts={activityCounts} />

      {/* Filters */}
      <ActivityFilter
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Activity List */}
      <div className="divide-y divide-white/[0.04] px-5">
        {visibleActivities.length > 0 ? (
          visibleActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
            />
          ))
        ) : (
          <ActivityEmptyState />
        )}
      </div>

      {/* Footer */}
      {filteredActivities.length > 5 && (
        <div className="border-t border-white/[0.06] px-5 py-3">
          <button
            type="button"
            onClick={handleToggleActivities}
            className="flex w-full items-center justify-center gap-2 text-xs font-medium text-gray-500 transition hover:text-white"
          >
            {showAllActivities
              ? "Show less activity"
              : "View all activity"}

            <RefreshCw
              className={`h-3.5 w-3.5 transition-transform ${
                showAllActivities ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityList;