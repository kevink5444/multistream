
import { useState, useEffect } from "react";
import {
  Plus,
  Radio,
  Play,
  Square,
  Clock,
  Monitor,
  Globe,
  Activity,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Video,
} from "lucide-react";

// ======================================================
// MOCK DATA
// ======================================================

const initialSources = [
  {
    id: 1,
    name: "Main Camera",
    type: "Camera",
    enabled: true,
  },
  {
    id: 2,
    name: "Desktop Capture",
    type: "Screen",
    enabled: true,
  },
  {
    id: 3,
    name: "Game Capture",
    type: "Window",
    enabled: true,
  },
  {
    id: 4,
    name: "Background Music",
    type: "Audio",
    enabled: true,
  },
];

const initialDestinations = [
  {
    id: 1,
    name: "YouTube Gaming",
    platform: "YouTube",
    enabled: true,
  },
  {
    id: 2,
    name: "Twitch Main",
    platform: "Twitch",
    enabled: true,
  },
  {
    id: 3,
    name: "Facebook Live",
    platform: "Facebook",
    enabled: false,
  },
];

const initialSessions = [
  {
    id: 1,
    name: "Gaming Stream",
    sourceIds: [2, 3, 4],
    destinationIds: [1, 2],
    status: "stopped",
    duration: 0,
    createdAt: new Date().toLocaleTimeString(),
  },
  {
    id: 2,
    name: "Camera Live",
    sourceIds: [1, 4],
    destinationIds: [1],
    status: "stopped",
    duration: 0,
    createdAt: new Date().toLocaleTimeString(),
  },
];

// ======================================================
// STATUS BADGE
// ======================================================

function SessionStatus({ status }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
        LIVE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
      <span className="h-2 w-2 rounded-full bg-zinc-500" />
      Stopped
    </span>
  );
}

// ======================================================
// FORMAT DURATION
// ======================================================

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(remainingSeconds).padStart(2, "0"),
  ].join(":");
}

// ======================================================
// SESSION CARD
// ======================================================

function SessionCard({
  session,
  sources,
  destinations,
  onStart,
  onStop,
  onDelete,
}) {
  const selectedSources = sources.filter((source) =>
    session.sourceIds.includes(source.id)
  );

  const selectedDestinations = destinations.filter((destination) =>
    session.destinationIds.includes(destination.id)
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118] p-5 transition hover:border-white/20">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
            <Radio className="h-6 w-6 text-indigo-400" />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              {session.name}
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              Session #{session.id}
            </p>
          </div>
        </div>

        <SessionStatus status={session.status} />
      </div>

      {/* Duration */}
      <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Session Duration
          </p>

          <Clock className="h-4 w-4 text-zinc-500" />
        </div>

        <p className={`mt-2 font-mono text-2xl font-bold ${
          session.status === "live"
            ? "text-red-400"
            : "text-white"
        }`}>
          {formatDuration(session.duration)}
        </p>
      </div>

      {/* Sources */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-zinc-500">
          SOURCES
        </p>

        <div className="flex flex-wrap gap-2">
          {selectedSources.length > 0 ? (
            selectedSources.map((source) => (
              <span
                key={source.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300"
              >
                <Monitor className="h-3.5 w-3.5 text-indigo-400" />
                {source.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-zinc-500">
              No sources selected
            </span>
          )}
        </div>
      </div>

      {/* Destinations */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-zinc-500">
          DESTINATIONS
        </p>

        <div className="flex flex-wrap gap-2">
          {selectedDestinations.length > 0 ? (
            selectedDestinations.map((destination) => (
              <span
                key={destination.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                {destination.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-zinc-500">
              No destinations selected
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">

        {session.status === "live" ? (
          <button
            onClick={() => onStop(session.id)}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop Streaming
          </button>
        ) : (
          <button
            onClick={() => onStart(session.id)}
            disabled={
              selectedSources.length === 0 ||
              selectedDestinations.length === 0
            }
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Streaming
          </button>
        )}

        <button
          onClick={() => onDelete(session.id)}
          disabled={session.status === "live"}
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
          title="Delete session"
        >
          <Trash2 className="h-4 w-4" />
        </button>

      </div>

    </div>
  );
}

// ======================================================
// CREATE SESSION MODAL
// ======================================================

function CreateSessionModal({
  sources,
  destinations,
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);

  const toggleSource = (id) => {
    setSelectedSources((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleDestination = (id) => {
    setSelectedDestinations((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedSources.length === 0) {
      alert("Please select at least one source.");
      return;
    }

    if (selectedDestinations.length === 0) {
      alert("Please select at least one destination.");
      return;
    }

    onCreate({
      name,
      sourceIds: selectedSources,
      destinationIds: selectedDestinations,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">

      <div className="my-8 w-full max-w-lg rounded-2xl border border-white/10 bg-[#15151d] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Create Live Session
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Configure your streaming session
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >

          {/* Session Name */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Session Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Gaming Stream"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
            />
          </div>

          {/* Sources */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Select Sources
            </label>

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">

              {sources.filter((source) => source.enabled).length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No enabled sources available.
                </p>
              ) : (
                sources
                  .filter((source) => source.enabled)
                  .map((source) => (
                    <label
                      key={source.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source.id)}
                        onChange={() => toggleSource(source.id)}
                        className="h-4 w-4 accent-indigo-500"
                      />

                      <Monitor className="h-4 w-4 text-indigo-400" />

                      <div>
                        <p className="text-sm text-white">
                          {source.name}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {source.type}
                        </p>
                      </div>
                    </label>
                  ))
              )}

            </div>
          </div>

          {/* Destinations */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Select Destinations
            </label>

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">

              {destinations.filter((destination) => destination.enabled).length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No enabled destinations available.
                </p>
              ) : (
                destinations
                  .filter((destination) => destination.enabled)
                  .map((destination) => (
                    <label
                      key={destination.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDestinations.includes(destination.id)}
                        onChange={() => toggleDestination(destination.id)}
                        className="h-4 w-4 accent-indigo-500"
                      />

                      <Globe className="h-4 w-4 text-emerald-400" />

                      <div>
                        <p className="text-sm text-white">
                          {destination.name}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {destination.platform}
                        </p>
                      </div>
                    </label>
                  ))
              )}

            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
            >
              Create Session
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

// ======================================================
// LIVE SESSIONS PAGE
// ======================================================

export default function LiveSessions() {
  const [sources] = useState(initialSources);

  const [destinations] = useState(initialDestinations);

  const [sessions, setSessions] = useState(initialSessions);

  const [modalOpen, setModalOpen] = useState(false);

  // Update duration while streaming
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.map((session) =>
          session.status === "live"
            ? {
                ...session,
                duration: session.duration + 1,
              }
            : session
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Statistics
  const totalSessions = sessions.length;

  const liveSessions = sessions.filter(
    (session) => session.status === "live"
  ).length;

  const stoppedSessions = sessions.filter(
    (session) => session.status === "stopped"
  ).length;

  // Create session
  const createSession = (data) => {
    const newSession = {
      id: Date.now(),
      name: data.name,
      sourceIds: data.sourceIds,
      destinationIds: data.destinationIds,
      status: "stopped",
      duration: 0,
      createdAt: new Date().toLocaleTimeString(),
    };

    setSessions((prev) => [newSession, ...prev]);
  };

  // Start streaming
  const startSession = (id) => {
    const session = sessions.find((item) => item.id === id);

    if (!session) return;

    setSessions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "live",
            }
          : item
      )
    );
  };

  // Stop streaming
  const stopSession = (id) => {
    setSessions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "stopped",
            }
          : item
      )
    );
  };

  // Delete session
  const deleteSession = (id) => {
    const session = sessions.find((item) => item.id === id);

    if (session?.status === "live") {
      alert("Stop the session before deleting it.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this session?"
    );

    if (!confirmed) return;

    setSessions((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Live Sessions
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage and control your streaming sessions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Create Session
        </button>

      </div>

      {/* ================================================== */}
      {/* STATISTICS */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Sessions */}
        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Total Sessions
            </p>

            <Radio className="h-5 w-5 text-indigo-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {totalSessions}
          </h2>
        </div>

        {/* Live */}
        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Live Sessions
            </p>

            <Activity className="h-5 w-5 text-red-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-red-400">
            {liveSessions}
          </h2>
        </div>

        {/* Stopped */}
        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Stopped Sessions
            </p>

            <Square className="h-5 w-5 text-zinc-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {stoppedSessions}
          </h2>
        </div>

        {/* Available Sources */}
        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Available Sources
            </p>

            <Video className="h-5 w-5 text-emerald-400" />
          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {sources.filter((source) => source.enabled).length}
          </h2>
        </div>

      </div>

      {/* ================================================== */}
      {/* SESSION LIST */}
      {/* ================================================== */}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Streaming Sessions
          </h2>

          <span className="text-sm text-zinc-500">
            {sessions.length} sessions
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111118] py-16 text-center">

            <Radio className="mx-auto h-10 w-10 text-zinc-600" />

            <h3 className="mt-4 font-semibold text-white">
              No sessions yet
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Create your first streaming session to get started.
            </p>

            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </button>

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                sources={sources}
                destinations={destinations}
                onStart={startSession}
                onStop={stopSession}
                onDelete={deleteSession}
              />
            ))}
          </div>
        )}

      </div>

      {/* ================================================== */}
      {/* CREATE SESSION MODAL */}
      {/* ================================================== */}

      {modalOpen && (
        <CreateSessionModal
          sources={sources}
          destinations={destinations}
          onClose={() => setModalOpen(false)}
          onCreate={createSession}
        />
      )}

    </div>
  );
}
