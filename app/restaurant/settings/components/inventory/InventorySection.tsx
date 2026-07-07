"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PillTabNav, TabDef } from "./components/PillTabNav";
import { OrderTimingTab } from "./tabs/OrderTimingTab";
import { AutoAcceptTab } from "./tabs/AutoAcceptTab";
import { KitchenCapacityTab } from "./tabs/KitchenCapacityTab";

type TabId = "timing" | "autoAccept" | "kitchen";

interface Props {
  restaurantId: string;
  showOnSite: boolean;
  isCorporate: boolean;
  onBack: () => void;
}

/**
 * Shell for the Menu & Ordering Rules screen. Owns nothing except the
 * active-tab id — every field, save, and fetch is scoped to its tab. Adding
 * a new tab means dropping in a `<XTab restaurantId={…} />` and adding it
 * to the `tabs` list.
 */
export const InventorySection = ({
  restaurantId,
  showOnSite,
  isCorporate,
  onBack,
}: Props) => {
  const showKitchen = showOnSite || isCorporate;

  const tabs: TabDef<TabId>[] = [
    { id: "timing", label: "Order Timing" },
    { id: "autoAccept", label: "Auto-Accept" },
    ...(showKitchen ? [{ id: "kitchen" as const, label: "Kitchen Capacity" }] : []),
  ];

  const [active, setActive] = useState<TabId>("timing");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Back to settings"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Menu &amp; Ordering Rules
            </h1>
            <p className="text-gray-600 mt-1">
              Order timing, cut-off schedules, kitchen capacity, and auto-accept settings.
            </p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="mb-6">
          <PillTabNav
            tabs={tabs}
            active={active}
            onChange={setActive}
            ariaLabel="Menu and ordering rules sections"
          />
        </div>

        {/* Active tab body — each tab owns its own state, save, and errors */}
        {active === "timing" && (
          <OrderTimingTab restaurantId={restaurantId} />
        )}
        {active === "autoAccept" && (
          <AutoAcceptTab restaurantId={restaurantId} />
        )}
        {active === "kitchen" && showKitchen && (
          <KitchenCapacityTab restaurantId={restaurantId} />
        )}
      </div>
    </div>
  );
};
