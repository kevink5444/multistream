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
  /* -------------------------------------------------------
     SYSTEM STATUS
     ------------------------------------------------------- */

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
  /* -------------------------------------------------------
     GET ALL DESTINATIONS
     ------------------------------------------------------- */

  async getDestinations() {
    return apiRequest("/api/destinations");
  },

  /* -------------------------------------------------------
     GET DESTINATION BY ID
     ------------------------------------------------------- */

  async getDestinationById(id) {
    return apiRequest(`/api/destinations/${id}`);
  },

  /* -------------------------------------------------------
     CREATE DESTINATION
     ------------------------------------------------------- */

  async createDestination(destinationData) {
    return apiRequest("/api/destinations", {
      method: "POST",
      body: JSON.stringify(destinationData),
    });
  },

  /* -------------------------------------------------------
     UPDATE DESTINATION
     ------------------------------------------------------- */

  async updateDestination(id, destinationData) {
    return apiRequest(`/api/destinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(destinationData),
    });
  },

  /* -------------------------------------------------------
     DELETE DESTINATION
     ------------------------------------------------------- */

  async deleteDestination(id) {
    return apiRequest(`/api/destinations/${id}`, {
      method: "DELETE",
    });
  },
  /* =========================================================
   ACTIVITY LOG API
   ========================================================= */

async getActivityLogs() {
  return apiRequest("/api/activity-logs");
},
/* -------------------------------------------------------
   CREATE ACTIVITY LOG
   ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     GET FORWARDER STATUSES
     ------------------------------------------------------- */

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
     SYSTEM INFORMATION API
     ========================================================= */

  async getSystemInfo() {
    return apiRequest("/api/system/info");
  },
};