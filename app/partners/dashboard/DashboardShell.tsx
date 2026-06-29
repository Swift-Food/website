"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Loader } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { useCoworkingAuth } from "@/lib/hooks/useCoworkingAuth";
import { coworkingApi } from "@/services/api/coworking.api";
import { SidebarPanel, type Tab } from "./DashboardSidebar";

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

const tabFromPath = (pathname: string): Tab => {
  if (pathname.includes("/calendar")) return "calendar";
  if (pathname.includes("/settings")) return "settings";
  return "orders";
};

// ---------------------------------------------------------------------------
// Context — exposes the active space to nested route pages
// ---------------------------------------------------------------------------

interface DashboardContextValue {
  spaceId: string;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const useDashboard = (): DashboardContextValue => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within the partner dashboard layout");
  }
  return ctx;
};

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, spaceId, spaceIds, logout } = useCoworkingAuth();

  // For multi-space admins, let them pick which space to manage.
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");

  const activeTab = tabFromPath(pathname);
  const meta = PAGE_META[activeTab];

  // Default to the first space once auth loads.
  useEffect(() => {
    if (spaceId && !selectedSpaceId) {
      setSelectedSpaceId(spaceId);
    }
  }, [spaceId, selectedSpaceId]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/partners/login");
    }
  }, [loading, isAuthenticated, router]);

  // Restore the collapsed preference after mount (avoids SSR mismatch).
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  // Load the partner space name for the sidebar header.
  useEffect(() => {
    if (!selectedSpaceId) return;
    let active = true;
    coworkingApi
      .getSpace(selectedSpaceId)
      .then((space) => {
        if (active) setPartnerName(space?.name ?? "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selectedSpaceId]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/partners/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size={36} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  // Authenticated but no space linked to this account.
  if (!selectedSpaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No partner space found</h2>
          <p className="text-sm text-gray-500 mb-6">
            This account isn't linked to any partner space. Contact Swift support to get access set up.
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ spaceId: selectedSpaceId }}>
      <div className="flex min-h-screen bg-[#F6F7F9] text-gray-900">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 p-3 transition-[width] duration-300 ease-in-out md:block",
            collapsed ? "w-[92px]" : "w-[320px]"
          )}
        >
          <div className="h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <SidebarPanel
              activeTab={activeTab}
              onLogout={handleLogout}
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
              partnerName={partnerName}
              spaceIds={spaceIds}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={setSelectedSpaceId}
            />
          </div>
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
              "absolute inset-y-0 left-0 w-[270px] bg-white shadow-xl transition-transform duration-300 ease-in-out",
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
              onLogout={handleLogout}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              partnerName={partnerName}
              spaceIds={spaceIds}
              selectedSpaceId={selectedSpaceId}
              onSelectSpace={setSelectedSpaceId}
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
            <div className="w-full">
              {/* Page header */}
              <div className="mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{meta.subtitle}</p>
              </div>

              {/* Page content */}
              <div>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};
