import { useEffect, useState } from "react";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { getCurrentUser } from "./services/authService";

// =====================================
// YOUTUBE LIVE LOADING PAGE
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
// APP
// =====================================

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authPage, setAuthPage] = useState("login");

  // =====================================
  // DETECT YOUTUBE LIVE LOADING PAGE
  // =====================================

  const isYouTubeLiveCreating =
    new URLSearchParams(window.location.search).get(
      "youtube-live-creating"
    ) === "1";

  // =====================================
  // CHECK SESSION
  // =====================================

  useEffect(() => {
    // Tidak perlu mengecek session pada halaman loading
    if (isYouTubeLiveCreating) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [isYouTubeLiveCreating]);

  // =====================================
  // AUTH HANDLERS
  // =====================================

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleRegisterSuccess = (registeredUser) => {
    setUser(registeredUser);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthPage("login");
  };

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
  // AUTH PAGES
  // =====================================

  if (!user) {
    if (authPage === "register") {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setAuthPage("register")}
      />
    );
  }

  // =====================================
  // DASHBOARD
  // =====================================

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;