import { useState } from "react";
import Sources from "../pages/Sources";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Dashboard from "../pages/Dashboard";
import Destinations from "../pages/Destinations";
import LiveSessions from "../pages/LiveSessions";
import Analytics from "../pages/Analytics";
import ActivityLogs from "../pages/ActivityLogs";
import Settings from "../pages/Settings";
import HelpCenter from "../pages/HelpCenter";
/* =====================================
   PAGE CONFIGURATION
===================================== */

const pageConfig = {
  dashboard: {
    title: "Dashboard",
    description: "Monitor your streaming performance.",
  },

  sources: {
    title: "Stream Sources",
    description: "Manage your incoming stream sources.",
  },

  destinations: {
    title: "Destinations",
    description: "Manage your streaming platforms.",
  },

  sessions: {
    title: "Streaming Sessions",
    description: "View and manage your streaming sessions.",
  },

  analytics: {
    title: "Analytics",
    description: "Analyze your streaming performance.",
  },

  logs: {
    title: "System Logs",
    description: "Monitor system events and logs.",
  },

  settings: {
    title: "Settings",
    description: "Configure your MultiStream application.",
  },

  help: {
    title: "Help Center",
    description: "Get help using MultiStream.",
  },
};

/* =====================================
   PLACEHOLDER PAGE
===================================== */

function PlaceholderPage({ title, description }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#12151C] px-6 text-center">

      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/10 bg-violet-500/10">
        <div className="h-6 w-6 rounded-lg border-2 border-violet-400/40" />
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
        {description}
      </p>

      {/* Coming Soon */}
      <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
        <span className="text-xs font-medium text-gray-500">
          Coming Soon
        </span>
      </div>
    </div>
  );
}

/* =====================================
   DASHBOARD LAYOUT
===================================== */

function DashboardLayout() {
  /* =====================================
     NAVIGATION STATE
  ===================================== */

  const [activePage, setActivePage] = useState("dashboard");

  /* =====================================
     SIDEBAR STATE
  ===================================== */

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  /* =====================================
     NAVIGATION HANDLER
  ===================================== */

  const handleNavigate = (page) => {
    setActivePage(page);

    // Close mobile sidebar after navigation
    setMobileOpen(false);
  };

  /* =====================================
     SIDEBAR HANDLERS
  ===================================== */

  const handleToggleCollapse = () => {
    setIsCollapsed((previous) => !previous);
  };

  const handleOpenMobileSidebar = () => {
    setMobileOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  /* =====================================
     PAGE CONFIGURATION
  ===================================== */

  const currentPage =
    pageConfig[activePage] || pageConfig.dashboard;

  /* =====================================
     PAGE CONTENT
  ===================================== */

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "sources":
        return (
          <Sources
            
          />
        );

      case "destinations":
        return (
          <Destinations
            />
        );

      case "sessions":
        return (
          <LiveSessions
        
          />
        );

      case "analytics":
        return (
          <Analytics
  
          />
        );

      case "logs":
        return (
          <ActivityLogs
            
          />
        );

      case "settings":
        return (
          <Settings
          />
        );

      case "help":
        return (
          <HelpCenter
           
          />
        );

      default:
        return <Dashboard />;
    }
  };

  /* =====================================
     MAIN LAYOUT
  ===================================== */

  return (
    <div className="min-h-screen bg-[#090B10] text-white">

      {/* =================================
          SIDEBAR
      ================================= */}

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />

      {/* =================================
          MAIN AREA
      ================================= */}

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

        {/* =================================
            TOPBAR
        ================================= */}

        <Topbar
          title={currentPage.title}
          description={currentPage.description}
          onOpenSidebar={handleOpenMobileSidebar}
        />

        {/* =================================
            CONTENT
        ================================= */}

        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">

          <div className="mx-auto w-full max-w-[1600px]">
            {renderPage()}
          </div>

        </main>

      </div>

      {/* =================================
          MOBILE OVERLAY
      ================================= */}

      {mobileOpen && (
        <button
          onClick={handleCloseMobileSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
        />
      )}

    </div>
  );
}

export default DashboardLayout;
