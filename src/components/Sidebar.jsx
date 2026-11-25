
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Cpu,
  LayoutDashboard,
  Radio,
  Settings,
  ShieldCheck,
  Terminal,
  Video,
  X,
  Zap,
} from "lucide-react";

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        id: "dashboard",
      },
      {
        name: "Sources",
        icon: Video,
        id: "sources",
      },
      {
        name: "Destinations",
        icon: Radio,
        id: "destinations",
      },
      {
        name: "Live Sessions",
        icon: Activity,
        id: "sessions",
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        name: "Analytics",
        icon: BarChart3,
        id: "analytics",
      },
      {
        name: "Activity Logs",
        icon: Terminal,
        id: "logs",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        name: "Settings",
        icon: Settings,
        id: "settings",
      },
      {
        name: "Help Center",
        icon: CircleHelp,
        id: "help",
      },
    ],
  },
];

function Sidebar({
  activePage = "dashboard",
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) {
  const handleNavigation = (pageId) => {
    onNavigate?.(pageId);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-white/[0.06]
          bg-[#0B0D12]
          transition-all duration-300 ease-in-out

          ${isCollapsed ? "w-[80px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.06] px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-[17px] font-bold tracking-tight text-white">
                  MultiStream
                </h1>

                <p className="text-[11px] text-gray-500">
                  Stream smarter
                </p>
              </div>
            )}
          </div>

          {/* Close Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navigationItems.map((section) => (
            <div key={section.title} className="mb-7">
              {!isCollapsed && (
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigation(item.id)}
                      title={isCollapsed ? item.name : undefined}
                      className={`
                        group relative flex w-full items-center gap-3
                        rounded-xl px-3 py-2.5
                        text-sm transition-all duration-200

                        ${
                          isActive
                            ? "bg-violet-500/10 text-violet-300"
                            : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                        }

                        ${isCollapsed ? "justify-center" : ""}
                      `}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-500" />
                      )}

                      <Icon
                        className={`
                          h-[18px] w-[18px] shrink-0
                          transition-colors

                          ${
                            isActive
                              ? "text-violet-400"
                              : "text-gray-500 group-hover:text-gray-300"
                          }
                        `}
                      />

                      {!isCollapsed && (
                        <span className="flex-1 text-left font-medium">
                          {item.name}
                        </span>
                      )}

                      {!isCollapsed && item.id === "sessions" && (
                        <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                          LIVE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CPU Efficiency */}
        {!isCollapsed && (
          <div className="mx-3 mb-4 rounded-xl border border-violet-500/10 bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.04] p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Cpu className="h-4 w-4 text-violet-400" />
              </div>

              <div>
                <p className="text-xs font-semibold text-white">
                  CPU Efficiency
                </p>

                <p className="text-[10px] text-gray-500">
                  Single encoding engine
                </p>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Encoding mode
              </span>

              <span className="text-[11px] font-medium text-emerald-400">
                CPU Saver
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
            </div>

            <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
              Encode once, distribute to multiple destinations.
            </p>
          </div>
        )}

        {/* System Status */}
        <div className="border-t border-white/[0.06] px-3 py-4">
          <div
            className={`
              flex items-center gap-3 rounded-xl
              bg-white/[0.02] px-3 py-3
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />

              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-[var(--sidebar-bg)] bg-emerald-400" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-white">
                  System Status
                </p>

                <p className="mt-0.5 text-[10px] text-emerald-400">
                  All systems operational
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <div className="hidden border-t border-white/[0.06] p-3 lg:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`
              flex w-full items-center gap-3 rounded-lg
              px-3 py-2 text-gray-500
              transition-colors hover:bg-white/[0.04]
              hover:text-white

              ${isCollapsed ? "justify-center" : ""}
            `}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}

            {!isCollapsed && (
              <span className="text-xs font-medium">
                Collapse Sidebar
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
