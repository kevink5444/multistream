/* =========================================================
   AUTH SERVICE
   ========================================================= */

const API_URL = "http://localhost:5000/api/auth";

/* =========================================================
   REGISTER
   ========================================================= */

export const register = async (data) => {
  const response = await fetch(
    `${API_URL}/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Registration failed."
    );
  }

  return result;
};

/* =========================================================
   LOGIN
   ========================================================= */

export const login = async (data) => {
  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Login failed."
    );
  }

  return result;
};

/* =========================================================
   GET CURRENT USER
   ========================================================= */

export const getCurrentUser = async () => {
  const response = await fetch(
    `${API_URL}/me`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();

  return result.data.user;
};

/* =========================================================
   LOGOUT
   ========================================================= */

export const logout = async () => {
  const response = await fetch(
    `${API_URL}/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Logout failed."
    );
  }

  return result;
};