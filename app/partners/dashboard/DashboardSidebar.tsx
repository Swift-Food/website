"use client";

import {
  ClipboardList,
  CalendarDays,
  Settings,
  LogOut,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";

export type Tab = "orders" | "calendar" | "settings";

export const NAV_ITEMS: {
  key: Tab;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "settings", label: "Settings", icon: Settings },
];

interface NavButtonProps {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavButton = ({ item, active, collapsed, onClick }: NavButtonProps) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-xl outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
        collapsed ? "h-11 w-11 justify-center" : "h-11 w-full gap-3 px-3",
        active
          ? collapsed
            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300/60"
            : "bg-indigo-50 text-indigo-700"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon
        size={19}
        strokeWidth={2}
        className={cn("shrink-0", active && !collapsed && "text-indigo-600")}
      />
      {!collapsed && (
        <span className="text-sm font-medium tracking-tight">{item.label}</span>
      )}

      {/* Tooltip — only when collapsed to the icon rail */}
      {collapsed && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
        >
          {item.label}
        </span>
      )}
    </button>
  );
};

interface SidebarPanelProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  spaceIds?: string[];
  selectedSpaceId?: string;
  onSelectSpace?: (id: string) => void;
}

export const SidebarPanel = ({
  activeTab,
  onTabChange,
  onLogout,
  collapsed,
  onToggleCollapse,
  spaceIds = [],
  selectedSpaceId,
  onSelectSpace,
}: SidebarPanelProps) => {
  const multiSpace = spaceIds.length > 1;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Brand + collapse toggle */}
      <div
        className={cn(
          "flex items-center border-b border-gray-100 px-4",
          collapsed ? "h-[68px] flex-col justify-center gap-2 px-0" : "h-[68px] gap-3"
        )}
      >
        <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-300/60">
            <Building2 size={18} strokeWidth={2.25} />
          </span>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">
                Swift Partner
              </p>
              <p className="text-xs font-medium text-gray-400">Dashboard</p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
              collapsed ? "h-8 w-8" : "ml-auto h-8 w-8"
            )}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-4", collapsed ? "px-3" : "px-3")}>
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>
        )}
        <div className={cn("flex flex-col gap-1", collapsed && "items-center")}>
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={activeTab === item.key}
              collapsed={collapsed}
              onClick={() => onTabChange(item.key)}
            />
          ))}
        </div>
      </nav>

      {/* Footer: space switcher + logout */}
      <div className={cn("border-t border-gray-100 p-3", collapsed && "px-3")}>
        {multiSpace && !collapsed && (
          <label className="mb-3 block">
            <span className="mb-1.5 block px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Active space
            </span>
            <div className="relative">
              <select
                value={selectedSpaceId}
                onChange={(e) => onSelectSpace?.(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm font-medium text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {spaceIds.map((id, i) => (
                  <option key={id} value={id}>
                    Space {i + 1} · {id.slice(0, 8)}…
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </label>
        )}

        <button
          onClick={onLogout}
          aria-label="Logout"
          className={cn(
            "group relative flex items-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
            collapsed ? "mx-auto h-11 w-11 justify-center" : "h-11 w-full gap-3 px-3"
          )}
        >
          <LogOut size={19} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
          {collapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
