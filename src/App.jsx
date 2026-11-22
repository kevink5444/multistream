import { useEffect, useState } from "react";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { getCurrentUser } from "./services/authService";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authPage, setAuthPage] = useState("login");

  useEffect(() => {
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
  }, []);

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

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;