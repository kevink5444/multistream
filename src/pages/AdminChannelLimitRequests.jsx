
import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../services/api";

import {
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  Layers3,
  User,
  Mail,
  CalendarDays,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusConfig = (status) => {
  const configs = {
    pending: {
      label: "Pending",
      className:
        "border-amber-500/20 bg-amber-500/10 text-amber-400",
      icon: Clock3,
    },

    approved: {
      label: "Approved",
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      icon: CheckCircle2,
    },

    rejected: {
      label: "Rejected",
      className:
        "border-rose-500/20 bg-rose-500/10 text-rose-400",
      icon: XCircle,
    },

    cancelled: {
      label: "Cancelled",
      className:
        "border-gray-500/20 bg-gray-500/10 text-gray-400",
      icon: XCircle,
    },
  };

  return (
    configs[status] || {
      label: status || "Unknown",
      className:
        "border-gray-500/20 bg-gray-500/10 text-gray-400",
      icon: AlertCircle,
    }
  );
};

const getRequestId = (request) => {
  return request?.id || request?._id || null;
};

/* =========================================================
   STATUS BADGE
========================================================= */

function RequestStatusBadge({ status }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#11131A] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-white">
            {value}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REQUEST CARD
========================================================= */

function RequestCard({
  request,
  onApprove,
  onReject,
  actionLoading,
}) {
  const isPending = request.status === "pending";
  const requestId = getRequestId(request);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#11131A] p-4 transition hover:border-white/[0.10] sm:p-5">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <User size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-medium text-white">
              {request.userName || "Unknown User"}
            </h3>

            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Mail size={13} />

              <span className="truncate">
                {request.userEmail || "-"}
              </span>
            </p>
          </div>
        </div>

        <RequestStatusBadge status={request.status} />
      </div>

      {/* LIMIT INFORMATION */}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
          <p className="text-xs text-gray-500">
            Current Limit
          </p>

          <p className="mt-1 text-lg font-semibold text-gray-300">
            {request.currentLimit ?? 0}

            <span className="ml-1 text-xs font-normal text-gray-500">
              channels
            </span>
          </p>
        </div>

        <div className="rounded-lg border border-violet-500/10 bg-violet-500/[0.04] p-3">
          <p className="text-xs text-gray-500">
            Requested Limit
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p className="text-lg font-semibold text-violet-400">
              {request.requestedLimit ?? 0}

              <span className="ml-1 text-xs font-normal text-gray-500">
                channels
              </span>
            </p>

            <ArrowUpRight
              size={15}
              className="text-violet-400"
            />
          </div>
        </div>
      </div>

      {/* REASON */}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-gray-500">
          Request Reason
        </p>

        <div className="rounded-lg bg-white/[0.02] p-3">
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">
            {request.reason || "No reason provided."}
          </p>
        </div>
      </div>

      {/* ADMIN NOTE */}

      {request.adminNote && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-gray-500">
            Admin Note
          </p>

          <div className="rounded-lg border border-rose-500/10 bg-rose-500/[0.03] p-3">
            <p className="whitespace-pre-wrap break-words text-sm text-gray-400">
              {request.adminNote}
            </p>
          </div>
        </div>
      )}

      {/* DATE */}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={13} />

          {formatDate(request.createdAt)}
        </span>

        <span className="max-w-full truncate">
          ID: {requestId || "-"}
        </span>
      </div>

      {/* ACTIONS */}

      {isPending && (
        <div className="mt-5 flex flex-col gap-2 border-t border-white/[0.05] pt-4 sm:flex-row">
          <button
            type="button"
            onClick={() => onApprove(request)}
            disabled={actionLoading}
            className="
              inline-flex flex-1 items-center
              justify-center gap-2 rounded-lg
              bg-emerald-600 px-4 py-2.5
              text-sm font-medium text-white
              transition hover:bg-emerald-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {actionLoading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2 size={16} />
            )}

            Approve Request
          </button>

          <button
            type="button"
            onClick={() => onReject(request)}
            disabled={actionLoading}
            className="
              inline-flex flex-1 items-center
              justify-center gap-2 rounded-lg
              border border-rose-500/20
              bg-rose-500/[0.05] px-4 py-2.5
              text-sm font-medium text-rose-400
              transition hover:bg-rose-500/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <XCircle size={16} />

            Reject Request
          </button>
        </div>
      )}

      {/* REVIEW INFORMATION */}

      {!isPending && request.reviewedAt && (
        <div className="mt-4 border-t border-white/[0.05] pt-3">
          <p className="text-xs text-gray-500">
            Reviewed at {formatDate(request.reviewedAt)}
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REJECT MODAL
========================================================= */

function RejectModal({
  request,
  note,
  setNote,
  onClose,
  onSubmit,
  loading,
}) {
  if (!request) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#11131A] shadow-2xl">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-white/[0.06] p-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <XCircle size={18} />
              </div>

              <h2 className="text-lg font-semibold text-white">
                Reject Request
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-400">
              Reject the channel limit request from{" "}
              <span className="font-medium text-white">
                {request.userName || "Unknown User"}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-5">
          <label
            htmlFor="admin-rejection-note"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Admin Note

            <span className="ml-1 text-gray-500">
              (Optional)
            </span>
          </label>

          <textarea
            id="admin-rejection-note"
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            maxLength={1000}
            rows={5}
            placeholder="Explain why this request is rejected..."
            disabled={loading}
            className="
              w-full resize-none rounded-xl
              border border-white/[0.08]
              bg-[#0B0D12] px-4 py-3
              text-sm text-white outline-none
              placeholder:text-gray-600
              focus:border-violet-500/50
              focus:ring-2 focus:ring-violet-500/10
              disabled:opacity-50
            "
          />

          <div className="mt-2 flex justify-end">
            <span className="text-xs text-gray-600">
              {note.length}/1000
            </span>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              rounded-lg border border-white/[0.08]
              px-4 py-2.5 text-sm text-gray-400
              transition hover:bg-white/[0.04]
              hover:text-white disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="
              inline-flex items-center justify-center
              gap-2 rounded-lg bg-rose-600
              px-4 py-2.5 text-sm font-medium
              text-white transition hover:bg-rose-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <XCircle size={16} />
            )}

            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN CHANNEL LIMIT REQUESTS
========================================================= */

function AdminChannelLimitRequests() {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [rejectRequest, setRejectRequest] =
    useState(null);

  const [rejectNote, setRejectNote] = useState("");

  const [rejectLoading, setRejectLoading] =
    useState(false);

  /* =======================================================
     FETCH REQUESTS
  ======================================================= */

  const fetchRequests = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await api.getAllChannelLimitRequests();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to retrieve channel limit requests."
          );
        }

        const requestData = Array.isArray(response.data)
          ? response.data
          : [];

        // Sort newest request first.
        const sortedRequests = [...requestData].sort(
          (a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();

            if (
              Number.isNaN(dateA) ||
              Number.isNaN(dateB)
            ) {
              return 0;
            }

            return dateB - dateA;
          }
        );

        setRequests(sortedRequests);
      } catch (error) {
        console.error(
          "Admin Channel Limit Requests Error:",
          error
        );

        setError(
          error.message ||
            "Failed to load channel limit requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter(
        (request) => request.status === "pending"
      ).length,

      approved: requests.filter(
        (request) => request.status === "approved"
      ).length,

      rejected: requests.filter(
        (request) => request.status === "rejected"
      ).length,
    };
  }, [requests]);

  /* =======================================================
     FILTER REQUESTS
  ======================================================= */

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" ||
        request.status === statusFilter;

      const matchesSearch =
        !query ||
        String(request.userName || "")
          .toLowerCase()
          .includes(query) ||
        String(request.userEmail || "")
          .toLowerCase()
          .includes(query) ||
        String(getRequestId(request) || "")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [requests, searchQuery, statusFilter]);

  /* =======================================================
     APPROVE REQUEST
  ======================================================= */

  const handleApprove = async (request) => {
    const requestId = getRequestId(request);

    if (!requestId) {
      setError("Invalid request ID.");
      return;
    }

    const confirmed = window.confirm(
      `Approve channel limit request from ${
        request.userName || "Unknown User"
      }?\n\n` +
        `Current limit: ${
          request.currentLimit ?? 0
        } channels\n` +
        `Requested limit: ${
          request.requestedLimit ?? 0
        } channels`
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(requestId);
      setError("");
      setSuccessMessage("");

      const response =
        await api.approveChannelLimitRequest(
          requestId
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to approve request."
        );
      }

      setSuccessMessage(
        `Request from ${
          request.userName || "Unknown User"
        } has been approved successfully.`
      );

      // Refresh data without clearing the success message.
      await fetchRequests(true);
    } catch (error) {
      console.error(
        "Approve Request Error:",
        error
      );

      setError(
        error.message ||
          "Failed to approve request."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  /* =======================================================
     OPEN REJECT MODAL
  ======================================================= */

  const handleOpenReject = (request) => {
    if (actionLoadingId) return;

    setRejectRequest(request);
    setRejectNote("");
    setError("");
    setSuccessMessage("");
  };

  /* =======================================================
     CLOSE REJECT MODAL
  ======================================================= */

  const handleCloseReject = () => {
    if (rejectLoading) return;

    setRejectRequest(null);
    setRejectNote("");
  };

  /* =======================================================
     REJECT REQUEST
  ======================================================= */

  const handleConfirmReject = async () => {
    if (!rejectRequest) return;

    const requestId = getRequestId(rejectRequest);

    if (!requestId) {
      setError("Invalid request ID.");
      return;
    }

    try {
      setRejectLoading(true);
      setActionLoadingId(requestId);

      setError("");
      setSuccessMessage("");

      const response =
        await api.rejectChannelLimitRequest(
          requestId,
          rejectNote.trim()
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to reject request."
        );
      }

      setSuccessMessage(
        `Request from ${
          rejectRequest.userName || "Unknown User"
        } has been rejected successfully.`
      );

      setRejectRequest(null);
      setRejectNote("");

      // Refresh data while preserving success message.
      await fetchRequests(true);
    } catch (error) {
      console.error(
        "Reject Request Error:",
        error
      );

      setError(
        error.message ||
          "Failed to reject request."
      );
    } finally {
      setRejectLoading(false);
      setActionLoadingId(null);
    }
  };

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers3
              size={22}
              className="text-violet-400"
            />

            <h1 className="text-xl font-semibold text-white">
              Channel Limit Requests
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Review and manage user requests for additional streaming capacity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchRequests(true)}
          disabled={refreshing || Boolean(actionLoadingId)}
          className="
            inline-flex items-center
            justify-center gap-2 rounded-lg
            border border-white/[0.08]
            bg-white/[0.02] px-4 py-2.5
            text-sm text-gray-300
            transition hover:bg-white/[0.05]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={statistics.total}
          description="All submitted requests"
          icon={Layers3}
          color="bg-violet-500/10 text-violet-400"
        />

        <StatCard
          title="Pending"
          value={statistics.pending}
          description="Awaiting review"
          icon={Clock3}
          color="bg-amber-500/10 text-amber-400"
        />

        <StatCard
          title="Approved"
          value={statistics.approved}
          description="Successfully approved"
          icon={CheckCircle2}
          color="bg-emerald-500/10 text-emerald-400"
        />

        <StatCard
          title="Rejected"
          value={statistics.rejected}
          description="Rejected requests"
          icon={XCircle}
          color="bg-rose-500/10 text-rose-400"
        />
      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-400">
              Action completed successfully
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={clearMessages}
            className="text-gray-500 transition hover:text-white"
            aria-label="Dismiss success message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-rose-400"
          />

          <div className="flex-1">
            <p className="text-sm font-medium text-rose-400">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={clearMessages}
            className="text-gray-500 transition hover:text-white"
            aria-label="Dismiss error message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* FILTERS */}

      <div className="rounded-xl border border-white/[0.06] bg-[#11131A] p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search name, email, or request ID..."
              className="
                w-full rounded-lg
                border border-white/[0.06]
                bg-[#0B0D12] py-2.5 pl-10
                pr-4 text-sm text-white
                outline-none placeholder:text-gray-600
                focus:border-violet-500/40
              "
            />
          </div>

          {/* STATUS FILTER */}

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "cancelled", label: "Cancelled" },
            ].map((filter) => {
              const active =
                statusFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(filter.value)
                  }
                  className={`
                    rounded-lg border px-3 py-2
                    text-xs font-medium transition
                    ${
                      active
                        ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                        : "border-white/[0.06] bg-white/[0.02] text-gray-500 hover:bg-white/[0.04] hover:text-gray-300"
                    }
                  `}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="text-gray-300">
              {filteredRequests.length}
            </span>{" "}
            of{" "}
            <span className="text-gray-300">
              {requests.length}
            </span>{" "}
            requests
          </p>
        </div>
      </div>

      {/* REQUEST LIST */}

      {loading ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#11131A]">
          <Loader2
            size={28}
            className="animate-spin text-violet-400"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading channel limit requests...
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#11131A] px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] text-gray-500">
            <Layers3 size={24} />
          </div>

          <h3 className="mt-4 text-base font-medium text-white">
            No requests found
          </h3>

          <p className="mt-2 max-w-sm text-sm text-gray-500">
            {searchQuery || statusFilter !== "all"
              ? "Try changing your search query or status filter."
              : "Channel limit requests will appear here when users submit them."}
          </p>

          {(searchQuery || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 text-sm font-medium text-violet-400 transition hover:text-violet-300"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
          {filteredRequests.map((request, index) => {
            const requestId = getRequestId(request);

            return (
              <RequestCard
                key={requestId || `request-${index}`}
                request={request}
                onApprove={handleApprove}
                onReject={handleOpenReject}
                actionLoading={Boolean(actionLoadingId)}
              />
            );
          })}
        </div>
      )}

      {/* REJECT MODAL */}

      {rejectRequest && (
        <RejectModal
          request={rejectRequest}
          note={rejectNote}
          setNote={setRejectNote}
          onClose={handleCloseReject}
          onSubmit={handleConfirmReject}
          loading={rejectLoading}
        />
      )}
    </div>
  );
}

export default AdminChannelLimitRequests;
