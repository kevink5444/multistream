
import { useState } from "react";

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

function Topbar({
  pageTitle = "Dashboard",
  pageDescription = "Monitor your streaming performance",
  onOpenMobileSidebar,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "System is ready",
      description: "MultiStream is ready for streaming.",
      time: "Just now",
      unread: true,
    },
    {
      id: 2,
      title: "Destination connected",
      description: "Your streaming destination is available.",
      time: "5 minutes ago",
      unread: true,
    },
    {
      id: 3,
      title: "CPU optimization enabled",
      description: "CPU Saver mode is active.",
      time: "10 minutes ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0D12]/90 backdrop-blur-xl">
      <div className="flex h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left Section */}
        <div className="flex min-w-0 items-center gap-3">

          {/* Mobile Menu Button */}
          <button
            onClick={onOpenMobileSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] text-gray-400 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page Information */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
              {pageTitle}
            </h1>

            <p className="hidden truncate text-xs text-gray-500 sm:block">
              {pageDescription}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Search */}
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

          {/* System Status */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/[0.05] px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[11px] font-medium text-emerald-400">
              System Online
            </span>
          </div>

          {/* Notification */}
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

            {/* Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#12151C] shadow-2xl shadow-black/30">

                {/* Header */}
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

                {/* Notification Items */}
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex gap-3 border-b border-white/[0.04] px-4 py-3 transition hover:bg-white/[0.02]"
                    >
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                        <Bell className="h-4 w-4 text-violet-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-medium text-white">
                            {notification.title}
                          </p>

                          {notification.unread && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                          )}
                        </div>

                        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                          {notification.description}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-600">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] py-3 text-xs text-gray-400 transition hover:bg-white/[0.03] hover:text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden h-6 w-px bg-white/[0.08] sm:block" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-white/[0.04]"
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-semibold text-white">
                K
              </div>

              <div className="hidden text-left xl:block">
                <p className="text-xs font-medium text-white">
                  Kevin
                </p>

                <p className="text-[10px] text-gray-500">
                  Administrator
                </p>
              </div>

              <ChevronDown className="hidden h-3.5 w-3.5 text-gray-500 xl:block" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-[200px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#12151C] shadow-2xl shadow-black/30">

                {/* Profile Info */}
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-sm font-medium text-white">
                    Kevin
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Administrator
                  </p>
                </div>

                {/* Menu */}
                <div className="p-1.5">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>

                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => setProfileOpen(false)}
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
