"use client";

import { useState } from "react";
import {
  LogOut,
  ClipboardList,
  CalendarDays,
  Settings,
  BarChart3,
  Building2,
} from "lucide-react";
import { OrdersList } from "./orders/OrdersList";
import { CoworkingCalendar } from "./calendar/CoworkingCalendar";
import { CoworkingSettings } from "./settings/CoworkingSettings";
import { CoworkingMetrics } from "./metrics/CoworkingMetrics";

type Tab = "orders" | "calendar" | "settings" | "metrics";

interface Props {
  spaceId: string;
  onLogout: () => void;
}

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "orders", label: "Orders", icon: <ClipboardList size={16} /> },
  { key: "calendar", label: "Calendar", icon: <CalendarDays size={16} /> },
  { key: "metrics", label: "Financials", icon: <BarChart3 size={16} /> },
  { key: "settings", label: "Settings", icon: <Settings size={16} /> },
];

export const CoworkingDashboard = ({ spaceId, onLogout }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
              <Building2 size={20} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Coworking Dashboard</h1>
              <p className="text-xs text-gray-500 font-mono">{spaceId}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Tab navigation */}
        <div className="bg-white border border-gray-200 rounded-xl mb-6">
          <nav className="flex overflow-x-auto">
            {TABS.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  idx === 0 ? "rounded-tl-xl" : ""
                } ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
          {activeTab === "orders" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Catering Orders</h2>
              <OrdersList spaceId={spaceId} />
            </>
          )}
          {activeTab === "calendar" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Event Calendar</h2>
              <CoworkingCalendar spaceId={spaceId} />
            </>
          )}
          {activeTab === "metrics" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Financial Overview</h2>
              <CoworkingMetrics spaceId={spaceId} />
            </>
          )}
          {activeTab === "settings" && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Space Settings</h2>
              <CoworkingSettings spaceId={spaceId} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
