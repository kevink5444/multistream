import { useEffect, useState } from "react";
import {
  Layers3,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Info,
  Send,
  History,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// =====================================
// API CONFIGURATION
// =====================================

const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || "Failed to communicate with the server."
    );
  }

  return result;
}

// =====================================
// DATA NORMALIZER
// =====================================

function getResponseData(response) {
  return response?.data ?? response;
}

function normalizeRequest(request) {
  return {
    id: request.id || request._id || Date.now(),
    currentLimit:
      Number(request.currentLimit ?? request.current_limit ?? 2),
    requestedLimit:
      Number(request.requestedLimit ?? request.requested_limit ?? 0),
    reason: request.reason || "",
    status: String(request.status || "pending").toLowerCase(),
    createdAt:
      request.createdAt ||
      request.created_at ||
      new Date().toISOString(),
    adminNote:
      request.adminNote ||
      request.admin_note ||
      "",
    reviewedAt:
      request.reviewedAt ||
      request.reviewed_at ||
      null,
  };
}

// =====================================
// CHANNEL LIMIT REQUEST PAGE
// =====================================

function ChannelLimitRequest() {
  // =====================================
  // STATE
  // =====================================

  const [currentLimit, setCurrentLimit] = useState(2);
  const [usedChannels, setUsedChannels] = useState(0);

  const [requestedLimit, setRequestedLimit] = useState(3);
  const [reason, setReason] = useState("");

  const [requests, setRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================
  // REQUEST STATUS
  // =====================================

  const hasPendingRequest = requests.some(
    (request) => request.status === "pending"
  );

  const latestRequest = requests[0] || null;

  // =====================================
  // LOAD DATA
  // =====================================

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // ---------------------------------
      // LOAD CHANNEL LIMIT STATUS
      // ---------------------------------

      const statusResponse = await apiRequest(
        "/channel-limit-requests/my/status"
      );

      const statusData = getResponseData(statusResponse);

      const accountLimit = Number(
        statusData.channelLimit ??
        statusData.currentLimit ??
        statusData.current_limit ??
        statusData.limit ??
        2
      );

      setCurrentLimit(accountLimit);

      // ---------------------------------
      // LOAD REQUEST HISTORY
      // ---------------------------------

      const historyResponse = await apiRequest(
        "/channel-limit-requests/my"
      );

      const historyData = getResponseData(historyResponse);

      let requestList = [];

      if (Array.isArray(historyData)) {
        requestList = historyData;
      } else if (Array.isArray(historyData.requests)) {
        requestList = historyData.requests;
      } else if (Array.isArray(historyData.data)) {
        requestList = historyData.data;
      }

      const normalizedRequests = requestList
        .map(normalizeRequest)
        .sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

      setRequests(normalizedRequests);

      // ---------------------------------
      // LOAD DESTINATIONS
      // ---------------------------------

      try {
        const destinationsResponse = await apiRequest(
          "/destinations"
        );

        const destinationsData =
          getResponseData(destinationsResponse);

        let destinations = [];

        if (Array.isArray(destinationsData)) {
          destinations = destinationsData;
        } else if (
          Array.isArray(destinationsData.destinations)
        ) {
          destinations = destinationsData.destinations;
        } else if (
          Array.isArray(destinationsData.data)
        ) {
          destinations = destinationsData.data;
        }

        setUsedChannels(destinations.length);
      } catch (destinationError) {
        console.warn(
          "Failed to load destination count:",
          destinationError
        );

        setUsedChannels(0);
      }

      // ---------------------------------
      // UPDATE REQUESTED LIMIT
      // ---------------------------------

      const pendingRequest = normalizedRequests.find(
        (request) => request.status === "pending"
      );

      if (pendingRequest) {
        setRequestedLimit(
          pendingRequest.requestedLimit
        );

        setReason(pendingRequest.reason);
      } else {
        setRequestedLimit(accountLimit + 1);
        setReason("");
      }
    } catch (error) {
      console.error(
        "Channel Limit Request Load Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Failed to load channel limit information."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    loadData();
  }, []);

  // =====================================
  // SUBMIT REQUEST
  // =====================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitted(false);

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

    if (requestedLimit <= currentLimit) {
      setErrorMessage(
        `Requested limit must be greater than your current limit (${currentLimit}).`
      );

      return;
    }

    if (!reason.trim()) {
      setErrorMessage(
        "Please provide a reason for your request."
      );

      return;
    }

    if (reason.trim().length < 10) {
      setErrorMessage(
        "Please provide a more detailed reason (minimum 10 characters)."
      );

      return;
    }

    if (hasPendingRequest) {
      setErrorMessage(
        "You already have a pending request."
      );

      return;
    }

    // ---------------------------------
    // SUBMIT TO BACKEND
    // ---------------------------------

    setIsSubmitting(true);

    try {
      const response = await apiRequest(
        "/channel-limit-requests",
        {
          method: "POST",
          body: JSON.stringify({
            requestedLimit: Number(requestedLimit),
            reason: reason.trim(),
          }),
        }
      );

      setSubmitted(true);

      setSuccessMessage(
        response.message ||
          "Your request has been submitted successfully."
      );

      setReason("");

      // Reload data from backend
      await loadData();
    } catch (error) {
      console.error(
        "Submit Channel Limit Request Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Failed to submit your request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================
  // STATUS CONFIGURATION
  // =====================================

  const getStatus = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          icon: CheckCircle2,
          className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        };

      case "rejected":
        return {
          label: "Rejected",
          icon: XCircle,
          className:
            "border-red-500/20 bg-red-500/10 text-red-400",
        };

      default:
        return {
          label: "Pending Review",
          icon: Clock3,
          className:
            "border-amber-500/20 bg-amber-500/10 text-amber-400",
        };
    }
  };

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="space-y-6">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div>
        <div className="flex items-center gap-2">
          <Layers3 className="h-5 w-5 text-violet-400" />

          <h2 className="text-xl font-semibold text-white">
            Channel Limit Request
          </h2>
        </div>

        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          Request additional streaming channels to expand
          your simultaneous streaming capacity.
        </p>
      </div>

      {/* =====================================
          LOADING
      ===================================== */}

      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#11141B] p-4">
          <RefreshCw className="h-5 w-5 animate-spin text-violet-400" />

          <p className="text-sm text-gray-400">
            Loading channel limit information...
          </p>
        </div>
      )}

      {/* =====================================
          ERROR MESSAGE
      ===================================== */}

      {errorMessage && (
        <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />

          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {errorMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-gray-300 transition hover:bg-white/[0.05]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* =====================================
          LIMIT OVERVIEW
      ===================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {/* CURRENT LIMIT */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Current Channel Limit
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Layers3 className="h-4 w-4 text-violet-400" />
            </div>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">
              {currentLimit}
            </h3>

            <span className="mb-1 text-sm text-gray-500">
              channels
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Maximum simultaneous destinations
          </p>
        </div>

        {/* USED CHANNELS */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Channels in Use
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <ArrowUpRight className="h-4 w-4 text-blue-400" />
            </div>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">
              {usedChannels}
            </h3>

            <span className="mb-1 text-sm text-gray-500">
              / {currentLimit}
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
              style={{
                width: `${Math.min(
                  (usedChannels / Math.max(currentLimit, 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {usedChannels >= currentLimit
              ? "All available channels are currently used."
              : `${currentLimit - usedChannels} channel available.`}
          </p>
        </div>

        {/* REQUEST STATUS */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Request Status
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock3 className="h-4 w-4 text-amber-400" />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-2xl font-bold capitalize text-white">
              {hasPendingRequest
                ? "Pending"
                : latestRequest
                ? latestRequest.status
                : "No Request"}
            </h3>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {hasPendingRequest
              ? "Your request is awaiting administrator review."
              : latestRequest
              ? `Your latest request was ${latestRequest.status}.`
              : "You currently have no active request."}
          </p>
        </div>
      </div>

      {/* =====================================
          INFORMATION
      ===================================== */}

      <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

        <div>
          <h3 className="text-sm font-medium text-blue-300">
            How channel limit requests work
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-400">
            Submit your request with the desired channel limit
            and explain why you need additional capacity.
            Your request will be reviewed by the administrator.
            Your channel limit will remain unchanged until
            the request is approved.
          </p>
        </div>
      </div>

      {/* =====================================
          REQUEST FORM
      ===================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">

        {/* FORM */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#11141B]">

          <div className="border-b border-white/[0.06] p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />

              <h3 className="font-semibold text-white">
                Request Additional Channels
              </h3>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to submit your request.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-5"
          >

            {/* CURRENT LIMIT */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Current Channel Limit
              </label>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0B0D12] px-4 py-3">
                <span className="text-sm text-gray-400">
                  Current account limit
                </span>

                <span className="font-semibold text-white">
                  {currentLimit} Channels
                </span>
              </div>
            </div>

            {/* REQUESTED LIMIT */}

            <div>
              <label
                htmlFor="requestedLimit"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Requested Channel Limit
              </label>

              <input
                id="requestedLimit"
                type="number"
                min={currentLimit + 1}
                max={100}
                value={requestedLimit}
                onChange={(event) =>
                  setRequestedLimit(
                    Number(event.target.value)
                  )
                }
                required
                disabled={hasPendingRequest || isSubmitting}
                className="
                  w-full rounded-xl border border-white/[0.08]
                  bg-[#0B0D12] px-4 py-3
                  text-white outline-none transition
                  focus:border-violet-500/50
                  focus:ring-2 focus:ring-violet-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter the total number of channels you want.
                Minimum: {currentLimit + 1}.
              </p>
            </div>

            {/* REASON */}

            <div>
              <label
                htmlFor="requestReason"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Reason for Request
              </label>

              <textarea
                id="requestReason"
                rows={5}
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
                placeholder="Explain why you need additional streaming channels..."
                required
                disabled={hasPendingRequest || isSubmitting}
                maxLength={1000}
                className="
                  w-full resize-none rounded-xl
                  border border-white/[0.08]
                  bg-[#0B0D12] px-4 py-3
                  text-sm text-white outline-none
                  placeholder:text-gray-600
                  focus:border-violet-500/50
                  focus:ring-2 focus:ring-violet-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-gray-600">
                  {reason.length}/1000
                </span>
              </div>
            </div>

            {/* SUCCESS MESSAGE */}

            {submitted && successMessage && (
              <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />

                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    Request submitted successfully
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}

            {errorMessage && (
              <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />

                <div>
                  <p className="text-sm font-medium text-red-400">
                    Request failed
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* PENDING MESSAGE */}

            {hasPendingRequest && (
              <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                <Clock3 className="h-5 w-5 shrink-0 text-amber-400" />

                <div>
                  <p className="text-sm font-medium text-amber-400">
                    Request under review
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    You already have a pending request.
                    Please wait for the administrator's
                    decision before submitting another request.
                  </p>
                </div>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                isLoading ||
                isSubmitting ||
                hasPendingRequest ||
                requestedLimit <= currentLimit ||
                !reason.trim()
              }
              className="
                flex w-full items-center justify-center
                gap-2 rounded-xl
                bg-gradient-to-r from-violet-600 to-blue-600
                px-4 py-3
                text-sm font-semibold text-white
                shadow-lg shadow-violet-500/10
                transition hover:brightness-110
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />

                  {hasPendingRequest
                    ? "Request Pending"
                    : "Submit Request"}
                </>
              )}
            </button>

          </form>
        </div>

        {/* REQUEST GUIDELINES */}

        <div className="space-y-4">

          <div className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />

              <h3 className="font-semibold text-white">
                Request Guidelines
              </h3>
            </div>

            <div className="mt-4 space-y-4">

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-400">
                  1
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Specify your needs
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Request the number of channels
                    you actually need.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-400">
                  2
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Provide a clear reason
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Explain your streaming use case
                    and why additional channels are needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-400">
                  3
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Wait for approval
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Your request will be reviewed by
                    the administrator.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* PROCESS */}

          <div className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5">
            <h3 className="font-semibold text-white">
              Approval Process
            </h3>

            <div className="mt-4 space-y-3">

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
                  <Send className="h-4 w-4 text-violet-400" />
                </div>

                <div>
                  <p className="text-sm text-gray-300">
                    Request Submitted
                  </p>

                  <p className="text-xs text-gray-500">
                    Your request is received
                  </p>
                </div>
              </div>

              <div className="ml-4 h-5 border-l border-dashed border-white/10" />

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                  <Clock3 className="h-4 w-4 text-amber-400" />
                </div>

                <div>
                  <p className="text-sm text-gray-300">
                    Administrator Review
                  </p>

                  <p className="text-xs text-gray-500">
                    Pending approval
                  </p>
                </div>
              </div>

              <div className="ml-4 h-5 border-l border-dashed border-white/10" />

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm text-gray-300">
                    Limit Updated
                  </p>

                  <p className="text-xs text-gray-500">
                    Only after approval
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* =====================================
          REQUEST HISTORY
      ===================================== */}

      <div className="rounded-2xl border border-white/[0.06] bg-[#11141B]">

        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />

            <h3 className="font-semibold text-white">
              Request History
            </h3>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-gray-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isLoading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-violet-400" />

            <p className="mt-3 text-sm text-gray-500">
              Loading request history...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03]">
              <History className="h-5 w-5 text-gray-500" />
            </div>

            <h4 className="mt-4 text-sm font-medium text-gray-300">
              No request history
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Your submitted channel limit requests
              will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {requests.map((request) => {
              const status = getStatus(request.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={request.id}
                  className="p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-white">
                          {request.currentLimit} →{" "}
                          {request.requestedLimit} Channels
                        </h4>

                        <span
                          className={`
                            inline-flex items-center gap-1.5
                            rounded-full border px-2.5 py-1
                            text-xs font-medium
                            ${status.className}
                          `}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />

                          {status.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {request.reason}
                      </p>

                      <p className="mt-3 text-xs text-gray-500">
                        Submitted {formatDate(request.createdAt)}
                      </p>

                      {request.adminNote && (
                        <div className="mt-3 rounded-lg border border-white/[0.06] bg-[#0B0D12] p-3">
                          <p className="text-xs font-medium text-gray-300">
                            Administrator Note
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            {request.adminNote}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}

export default ChannelLimitRequest;