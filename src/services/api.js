
/* =========================================================
   MULTISTREAM API SERVICE
   ========================================================= */

const API_BASE_URL = "http://localhost:5000";

/* =========================================================
   API REQUEST HELPER
   ========================================================= */

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,

      // Mengirim session cookie ke backend
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/* =========================================================
   API
   ========================================================= */

export const api = {
  /* =========================================================
     SYSTEM STATUS
     ========================================================= */

  async getStatus() {
    return apiRequest("/api/status");
  },

  /* =========================================================
     UPDATE USER PROFILE
     ========================================================= */

  async updateProfile(profileData) {
    return apiRequest("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  /* =========================================================
     DESTINATIONS API
     ========================================================= */

  async getDestinations() {
    return apiRequest("/api/destinations");
  },

  async getDestinationById(id) {
    return apiRequest(`/api/destinations/${id}`);
  },

  async createDestination(destinationData) {
    return apiRequest("/api/destinations", {
      method: "POST",
      body: JSON.stringify(destinationData),
    });
  },

  async updateDestination(id, destinationData) {
    return apiRequest(`/api/destinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(destinationData),
    });
  },

  async deleteDestination(id) {
    return apiRequest(`/api/destinations/${id}`, {
      method: "DELETE",
    });
  },

  /* =========================================================
     SOURCES API
     ========================================================= */

  async getSources() {
    return apiRequest("/api/sources");
  },

  async getSourceById(id) {
    return apiRequest(`/api/sources/${id}`);
  },

  async createSource(data) {
    return apiRequest("/api/sources", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSource(id, data) {
    return apiRequest(`/api/sources/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSource(id) {
    return apiRequest(`/api/sources/${id}`, {
      method: "DELETE",
    });
  },

  /* =========================================================
     ACTIVITY LOG API
     ========================================================= */

  async getActivityLogs() {
    return apiRequest("/api/activity-logs");
  },

  async createActivityLog(logData) {
    return apiRequest("/api/activity-logs", {
      method: "POST",
      body: JSON.stringify(logData),
    });
  },

  async clearActivityLogs() {
    return apiRequest("/api/activity-logs", {
      method: "DELETE",
    });
  },

  /* =========================================================
     FORWARDER STATUS API
     ========================================================= */

  async getForwarderStatuses() {
    return apiRequest("/api/forwarders/status");
  },

  /* =========================================================
     NOTIFICATION API
     ========================================================= */

  async getNotifications() {
    return apiRequest("/api/notifications");
  },

  async markNotificationAsRead(id) {
    return apiRequest(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  async markAllNotificationsAsRead() {
    return apiRequest("/api/notifications/read-all", {
      method: "PATCH",
    });
  },

  async clearNotifications() {
    return apiRequest("/api/notifications", {
      method: "DELETE",
    });
  },

  /* =========================================================
     CHANNEL LIMIT REQUEST API
     ========================================================= */

  /* ---------------------------------------------------------
     USER: GET CHANNEL LIMIT STATUS
     --------------------------------------------------------- */

  async getChannelLimitStatus() {
    return apiRequest("/api/channel-limit-requests/my/status");
  },

  /* ---------------------------------------------------------
     USER: GET MY REQUEST HISTORY
     --------------------------------------------------------- */

  async getMyChannelLimitRequests() {
    return apiRequest("/api/channel-limit-requests/my");
  },

  /* ---------------------------------------------------------
     USER: CREATE CHANNEL LIMIT REQUEST
     --------------------------------------------------------- */

  async createChannelLimitRequest(requestData) {
    return apiRequest("/api/channel-limit-requests", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  },

  /* ---------------------------------------------------------
     USER: CANCEL CHANNEL LIMIT REQUEST
     --------------------------------------------------------- */

  async cancelChannelLimitRequest(id) {
    return apiRequest(`/api/channel-limit-requests/${id}/cancel`, {
      method: "PATCH",
    });
  },

  /* ---------------------------------------------------------
     ADMIN: GET ALL CHANNEL LIMIT REQUESTS
     --------------------------------------------------------- */

  async getAllChannelLimitRequests() {
    return apiRequest("/api/channel-limit-requests/admin");
  },

  /* ---------------------------------------------------------
     ADMIN: APPROVE CHANNEL LIMIT REQUEST
     --------------------------------------------------------- */

  async approveChannelLimitRequest(id) {
    return apiRequest(`/api/channel-limit-requests/${id}/approve`, {
      method: "PATCH",
    });
  },

  /* ---------------------------------------------------------
     ADMIN: REJECT CHANNEL LIMIT REQUEST
     --------------------------------------------------------- */

  async rejectChannelLimitRequest(id, rejectionNote = "") {
    return apiRequest(`/api/channel-limit-requests/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({
        note: rejectionNote,
      }),
    });
  },

  /* =========================================================
     SYSTEM INFORMATION API
     ========================================================= */

  async getSystemInfo() {
    return apiRequest("/api/system/info");
  },
};
