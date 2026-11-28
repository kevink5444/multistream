import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import Sources from "../pages/Sources";
import Destinations from "../pages/Destinations";
import Analytics from "../pages/Analytics";
import ActivityLogs from "../pages/ActivityLogs";
import Settings from "../pages/Settings";
import HelpCenter from "../pages/HelpCenter";
import ChannelLimitRequest from "../pages/ChannelLimitRequest";

import AdminChannelLimitRequests from "../pages/AdminChannelLimitRequests";

/* =========================================================
   PAGE CONFIGURATION
========================================================= */

const pageConfig = {
  dashboard: {
    title: "Dashboard",
    description:
      "Monitor your streaming performance.",
  },

  sources: {
    title: "Stream Sources",
    description:
      "Manage your incoming stream sources.",
  },

  destinations: {
    title: "Destinations",
    description:
      "Manage your streaming platforms.",
  },

  analytics: {
    title: "Analytics",
    description:
      "Analyze your streaming performance.",
  },

  logs: {
    title: "System Logs",
    description:
      "Monitor system events and logs.",
  },

  settings: {
    title: "Settings",
    description:
      "Configure your MultiStream application.",
  },

  help: {
    title: "Help Center",
    description:
      "Get help using MultiStream.",
  },

  profile: {
    title: "My Profile",
    description:
      "Manage your account information.",
  },

  "channel-limit-request": {
    title: "Channel Limit Request",
    description:
      "Request additional streaming channel capacity.",
  },

  "admin-channel-limit-requests": {
    title: "Channel Limit Requests",
    description:
      "Review and manage channel limit requests.",
  },
};

/* =========================================================
   DASHBOARD LAYOUT
========================================================= */

function DashboardLayout({
  user,
  onLogout,
  onProfileUpdated,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  /* =======================================================
     CURRENT PAGE
  ======================================================= */

  const activePage =
    location.pathname
      .split("/")
      .filter(Boolean)[0] || "dashboard";

  /* =======================================================
     SIDEBAR STATE
  ======================================================= */

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigate = (page) => {
    navigate(`/${page}`);

    setMobileOpen(false);
  };

  /* =======================================================
     SIDEBAR HANDLERS
  ======================================================= */

  const handleToggleCollapse = () => {
    setIsCollapsed((previous) => !previous);
  };

  const handleOpenMobileSidebar = () => {
    setMobileOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  /* =======================================================
     PAGE CONFIGURATION
  ======================================================= */

  const currentPage =
    pageConfig[activePage] ||
    pageConfig.dashboard;

  /* =======================================================
     PAGE CONTENT
  ======================================================= */

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "sources":
        return <Sources />;

      case "destinations":
        return <Destinations />;

      case "analytics":
        return <Analytics />;

      case "logs":
        return <ActivityLogs />;

      case "settings":
        return <Settings />;

      case "help":
        return <HelpCenter />;

      case "profile":
        return (
          <Profile
            user={user}
            onProfileUpdated={onProfileUpdated}
          />
        );

      case "channel-limit-request":
        return <ChannelLimitRequest />;

      /* ===================================================
         ADMIN PAGE
      =================================================== */

      case "admin-channel-limit-requests":
        if (user?.role !== "admin") {
          return (
            <Navigate
              to="/dashboard"
              replace
            />
          );
        }

        return <AdminChannelLimitRequests />;

      default:
        return <Dashboard />;
    }
  };

  /* =========================================================
     MAIN LAYOUT
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#090B10] text-white">
      {/* ===================================================
         SIDEBAR
      =================================================== */}

      <Sidebar
        user={user}
        activePage={activePage}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />

      {/* ===================================================
         MAIN AREA
      =================================================== */}

      <div
        className={`
          min-h-screen transition-all duration-300

          ${
            isCollapsed
              ? "lg:pl-[80px]"
              : "lg:pl-[260px]"
          }
        `}
      >
        {/* =================================================
           TOPBAR
        ================================================= */}

        <Topbar
          pageTitle={currentPage.title}
          pageDescription={currentPage.description}
          onOpenMobileSidebar={
            handleOpenMobileSidebar
          }
          user={user}
          onLogout={onLogout}
          onNavigateProfile={() =>
            handleNavigate("profile")
          }
        />

        {/* =================================================
           CONTENT
        ================================================= */}

        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;