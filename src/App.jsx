import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { getCurrentUser } from "./services/authService";

// =====================================
// THEME HELPER
// =====================================

function applyTheme(theme) {
  let selectedTheme = theme;

  if (theme === "system") {
    selectedTheme = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches
      ? "light"
      : "dark";
  }

  document.documentElement.setAttribute(
    "data-theme",
    selectedTheme
  );

  document.documentElement.style.colorScheme =
    selectedTheme;

  return selectedTheme;
}

// =====================================
// LOADING PAGE
// =====================================

function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090B10] text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />

        <p className="text-sm text-gray-400">
          Checking authentication...
        </p>
      </div>
    </div>
  );
}

// =====================================
// YOUTUBE LIVE LOADING
// =====================================

function YouTubeLiveLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090B10] text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />

        <h1 className="text-xl font-semibold">
          Creating YouTube Live
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Please wait while your Live Control Room is being prepared.
        </p>
      </div>
    </div>
  );
}

// =====================================
// APP ROUTES
// =====================================

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const resetToken =
    queryParams.get("token") ||
    queryParams.get("resetToken");

  const isYouTubeLiveCreating =
    queryParams.get("youtube-live-creating") === "1";

  // =====================================
  // CHECK SESSION
  // =====================================

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch (error) {
        console.error("Session check failed:", error);

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  // =====================================
  // LOAD APPLICATION THEME
  // =====================================

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setTheme("dark");
      applyTheme("dark");
      return;
    }

    async function loadTheme() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/settings",
          {
            credentials: "include",
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          const savedTheme =
            result.data?.theme || "dark";

          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      } catch (error) {
        console.error(
          "Failed to load application theme:",
          error
        );

        setTheme("dark");
        applyTheme("dark");
      }
    }

    loadTheme();
  }, [isLoading, user]);

  // =====================================
  // THEME CHANGE LISTENER
  // =====================================

  useEffect(() => {
    const handleThemeChange = (event) => {
      const newTheme = event.detail;

      setTheme(newTheme);
      applyTheme(newTheme);
    };

    window.addEventListener(
      "multistream-theme-change",
      handleThemeChange
    );

    return () => {
      window.removeEventListener(
        "multistream-theme-change",
        handleThemeChange
      );
    };
  }, []);

  // =====================================
  // SYSTEM THEME LISTENER
  // =====================================

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: light)"
    );

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [theme]);

  // =====================================
  // AUTH HANDLERS
  // =====================================

  function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser);
  }

  function handleRegisterSuccess(registeredUser) {
    setUser(registeredUser);
  }

  function handleLogout() {
    setUser(null);
  }

  // =====================================
  // YOUTUBE LIVE LOADING
  // =====================================

  if (isYouTubeLiveCreating) {
    return <YouTubeLiveLoading />;
  }

  // =====================================
  // AUTH LOADING
  // =====================================

  if (isLoading) {
    return <LoadingPage />;
  }

  // =====================================
  // ROUTES
  // =====================================

  return (
    <Routes>
      {/* ROOT */}

      <Route
        path="/"
        element={
          resetToken ? (
            <Navigate
              to={`/reset-password?token=${encodeURIComponent(
                resetToken
              )}`}
              replace
            />
          ) : user ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* LOGIN */}

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateRegister={() => {
                window.location.assign("/register");
              }}
              onNavigateForgotPassword={() => {
                window.location.assign("/forgot-password");
              }}
            />
          )
          }
      />

      {/* REGISTER */}

      <Route
        path="/register"
        element={
          user ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              onNavigateLogin={() => {
                window.location.assign("/login");
              }}
            />
          )
          }
      />

      {/* FORGOT PASSWORD */}

      <Route
        path="/forgot-password"
        element={
          user ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <ForgotPassword
              onNavigateLogin={() => {
                window.location.assign("/login");
              }}
            />
          )
          }
      />

      {/* RESET PASSWORD */}

      <Route
        path="/reset-password"
        element={
          <ResetPassword
            token={resetToken}
            onNavigateLogin={() => {
              window.location.assign("/login");
            }}
          />
        }
      />

      {/* PROTECTED ROUTES */}

      <Route
        path="/*"
        element={
          user ? (
            <DashboardLayout
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />
    </Routes>
  );
}

// =====================================
// ROOT APP
// =====================================

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;