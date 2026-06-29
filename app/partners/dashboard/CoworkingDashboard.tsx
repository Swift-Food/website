"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { OrdersList } from "./orders/OrdersList";
import { CoworkingCalendar } from "./calendar/CoworkingCalendar";
import { CoworkingSettings } from "./settings/CoworkingSettings";
import { SidebarPanel, NAV_ITEMS, type Tab } from "./DashboardSidebar";

interface Props {
  spaceId: string;
  onLogout: () => void;
  spaceIds?: string[];
  selectedSpaceId?: string;
  onSelectSpace?: (id: string) => void;
}

const COLLAPSE_KEY = "partner_sidebar_collapsed";

const PAGE_META: Record<Tab, { title: string; subtitle: string }> = {
  orders: {
    title: "Catering Orders",
    subtitle: "Track every order placed through your space.",
  },
  calendar: {
    title: "Event Calendar",
    subtitle: "See upcoming deliveries and events at a glance.",
  },
  settings: {
    title: "Space Settings",
    subtitle: "Manage how your space appears and operates.",
  },
};

export const CoworkingDashboard = ({
  spaceId,
  onLogout,
  spaceIds = [],
  selectedSpaceId,
  onSelectSpace,
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore the collapsed preference after mount (avoids SSR mismatch).
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const meta = PAGE_META[activeTab];

  return (
    <div className="flex min-h-screen bg-[#F6F7F9] text-gray-900">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-gray-200/80 transition-[width] duration-300 ease-in-out md:block",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <SidebarPanel
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={onLogout}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          spaceIds={spaceIds}
          selectedSpaceId={selectedSpaceId}
          onSelectSpace={onSelectSpace}
        />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[270px] border-r border-gray-200 shadow-xl transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
          <SidebarPanel
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={onLogout}
            collapsed={false}
            spaceIds={spaceIds}
            selectedSpaceId={selectedSpaceId}
            onSelectSpace={onSelectSpace}
          />
        </div>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <span className="text-[15px] font-semibold tracking-tight">
            {meta.title}
          </span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-5xl">
            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                {meta.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{meta.subtitle}</p>
            </div>

            {/* Content card */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm shadow-gray-200/50 sm:p-6">
              {activeTab === "orders" && <OrdersList spaceId={spaceId} />}
              {activeTab === "calendar" && <CoworkingCalendar spaceId={spaceId} />}
              {activeTab === "settings" && <CoworkingSettings spaceId={spaceId} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Re-exported so callers importing from the dashboard keep working.
export { NAV_ITEMS };
