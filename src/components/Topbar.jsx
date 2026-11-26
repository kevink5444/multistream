
import { useState, useEffect, useRef } from "react";
import { logout } from "../services/authService";
import { api } from "../services/api";

import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  Check,
} from "lucide-react";

// =====================================
// TOPBAR
// =====================================

function Topbar({
  pageTitle = "Dashboard",
  pageDescription = "Monitor your streaming performance",
  onOpenMobileSidebar,
  onNavigateProfile,
  user,
  onLogout,
}) {
  // =====================================
  // STATE
  // =====================================

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [systemOnline, setSystemOnline] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const connectionStateRef = useRef(null);

  // =====================================
  // UNREAD NOTIFICATIONS
  // =====================================

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = async () => {
    try {
      await logout();

      setProfileOpen(false);

      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  // =====================================
  // FETCH NOTIFICATIONS
  // =====================================

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();

      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error(
        "[Topbar] Failed to fetch notifications:",
        error.message
      );
    }
  };

  // =====================================
  // MARK NOTIFICATION AS READ
  // =====================================

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);

      setNotifications((previous) =>
        previous.map((notification) =>
          String(notification.id) === String(id)
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "[Topbar] Failed to mark notification as read:",
        error.message
      );
    }
  };

  // =====================================
  // MARK ALL NOTIFICATIONS AS READ
  // =====================================

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "[Topbar] Failed to mark all notifications as read:",
        error.message
      );
    }
  };

  // =====================================
  // BACKEND CONNECTION MONITOR
  // =====================================

  useEffect(() => {
    let mounted = true;

    const checkBackend = async () => {
      try {
        await api.getStatus();

        if (!mounted) return;

        setSystemOnline(true);

        // Connection restored
        if (connectionStateRef.current === false) {
          try {
            await api.createActivityLog({
              type: "success",
              category: "system",
              title: "Backend connection restored",
              description:
                "Frontend successfully reconnected to MultiStream backend.",
              destination: "System",
              metadata: {
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            console.error(
              "[Connection Monitor] Failed to create log:",
              error.message
            );
          }

          await fetchNotifications();
        }

        connectionStateRef.current = true;
      } catch (error) {
        if (!mounted) return;

        setSystemOnline(false);

        // Connection lost
        if (connectionStateRef.current === true) {
          connectionStateRef.current = false;

          console.warn(
            "[MultiStream] Backend connection lost"
          );
        }
      }
    };

    checkBackend();

    const interval = setInterval(checkBackend, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // =====================================
  // NOTIFICATION POLLING
  // =====================================

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =====================================
  // RENDER
  // =====================================

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0D12]/90 backdrop-blur-xl">
      <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* LEFT SECTION */}
        <div className="flex min-w-0 items-center gap-3">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={onOpenMobileSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] text-gray-400 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* PAGE INFORMATION */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
              {pageTitle}
            </h1>

            <p className="hidden truncate text-xs text-gray-500 sm:block">
              {pageDescription}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* SEARCH */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="h-9 w-[200px] rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/40 focus:bg-white/[0.04] lg:w-[240px]"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* SYSTEM STATUS */}
          <div
            className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${
              systemOnline
                ? "border-emerald-500/10 bg-emerald-500/[0.05]"
                : "border-red-500/10 bg-red-500/[0.05]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {systemOnline && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
              )}

              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  systemOnline
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />
            </span>

            <span
              className={`text-[11px] font-medium ${
                systemOnline
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {systemOnline
                ? "System Online"
                : "System Offline"}
            </span>
          </div>

          {/* NOTIFICATION */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />

              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#12151C] shadow-2xl shadow-black/30">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Notifications
                    </h3>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {unreadCount} unread notifications
                    </p>
                  </div>

                  <button
                    onClick={() => setNotificationOpen(false)}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {/* NOTIFICATION ITEMS */}
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                        className="flex w-full gap-3 border-b border-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.02]"
                      >
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                          <Bell className="h-4 w-4 text-violet-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs font-medium text-white">
                              {notification.title}
                            </p>

                            {!notification.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                            )}
                          </div>

                          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                            {notification.description}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            {notification.time || ""}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="mx-auto h-6 w-6 text-gray-600" />

                      <p className="mt-2 text-xs text-gray-400">
                        No notifications
                      </p>

                      <p className="mt-1 text-[10px] text-gray-600">
                        You're all caught up.
                      </p>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] py-3 text-xs text-gray-400 transition hover:bg-white/[0.03] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="hidden h-6 w-px bg-white/[0.08] sm:block" />

          {/* PROFILE */}
          <div className="relative">

            {/* PROFILE BUTTON */}
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-white/[0.04]"
            >
              {/* AVATAR */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* USER INFORMATION */}
              <div className="hidden text-left xl:block">
                <p className="text-xs font-medium text-white">
                  {user?.name || "User"}
                </p>

                <p className="text-[10px] text-gray-500">
                  {user?.role === "admin"
                    ? "Administrator"
                    : "User"}
                </p>
              </div>

              <ChevronDown className="hidden h-3.5 w-3.5 text-gray-500 xl:block" />
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-[200px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#12151C] shadow-2xl shadow-black/30">

                {/* PROFILE INFORMATION */}
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-sm font-medium text-white">
                    {user?.name || "User"}
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    {user?.email || ""}
                  </p>
                </div>

                {/* MENU */}
                <div className="p-1.5">

                  {/* MY PROFILE */}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigateProfile?.();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>

                  {/* SETTINGS */}
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>

                  {/* SIGN OUT */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/[0.05]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
