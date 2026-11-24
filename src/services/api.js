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
};