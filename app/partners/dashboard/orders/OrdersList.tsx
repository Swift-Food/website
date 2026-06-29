"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { coworkingApi } from "@/services/api/coworking.api";
import { DashboardOrderSummary } from "@/types/api/coworking.api.types";
import { OrderCard } from "./OrderCard";
import { OrderDetailModal } from "./OrderDetailModal";

interface Props {
  spaceId: string;
}

type GroupKey = "active" | "closed" | "all";

const ACTIVE_STATUSES = [
  "pending_review",
  "admin_reviewed",
  "restaurant_reviewed",
  "payment_link_sent",
  "paid",
  "confirmed",
];
const CLOSED_STATUSES = ["completed", "cancelled"];
const ALL_STATUSES = [...ACTIVE_STATUSES, ...CLOSED_STATUSES];

const GROUPS: { key: GroupKey; label: string; statuses: string[] | null }[] = [
  { key: "active", label: "Active", statuses: ACTIVE_STATUSES },
  { key: "closed", label: "Closed", statuses: CLOSED_STATUSES },
  { key: "all", label: "All", statuses: null },
];

// Sub-filters per group. `statuses` is the set each pill matches.
const SUB_FILTERS: Record<GroupKey, { key: string; label: string; statuses: string[] }[]> = {
  active: [
    { key: "all", label: "All", statuses: ACTIVE_STATUSES },
    { key: "pending_review", label: "Pending Review", statuses: ["pending_review", "admin_reviewed"] },
    { key: "awaiting_payment", label: "Awaiting Payment", statuses: ["restaurant_reviewed", "payment_link_sent"] },
    { key: "confirmed", label: "Confirmed", statuses: ["paid", "confirmed"] },
  ],
  closed: [
    { key: "all", label: "All", statuses: CLOSED_STATUSES },
    { key: "completed", label: "Completed", statuses: ["completed"] },
    { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  ],
  all: [
    { key: "all", label: "All", statuses: ALL_STATUSES },
    { key: "pending_review", label: "Pending Review", statuses: ["pending_review", "admin_reviewed"] },
    { key: "awaiting_payment", label: "Awaiting Payment", statuses: ["restaurant_reviewed", "payment_link_sent"] },
    { key: "confirmed", label: "Confirmed", statuses: ["paid", "confirmed"] },
    { key: "completed", label: "Completed", statuses: ["completed"] },
    { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  ],
};

export const OrdersList = ({ spaceId }: Props) => {
  const [orders, setOrders] = useState<DashboardOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [group, setGroup] = useState<GroupKey>("active");
  const [sub, setSub] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    coworkingApi
      .getOrders(spaceId)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [spaceId]);

  const selectGroup = (key: GroupKey) => {
    setGroup(key);
    setSub("all");
  };

  const countForStatuses = (statuses: string[] | null) => {
    if (!statuses) return orders.length;
    const set = new Set(statuses);
    return orders.filter((o) => set.has(o.status)).length;
  };

  const filteredOrders = useMemo(() => {
    // "All → All" shows everything (including any unmapped status).
    if (group === "all" && sub === "all") return orders;
    const subs = SUB_FILTERS[group];
    const current = subs.find((s) => s.key === sub) ?? subs[0];
    const set = new Set(current.statuses);
    return orders.filter((o) => set.has(o.status));
  }, [orders, group, sub]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <AlertCircle size={16} className="flex-shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Two-tier status filter */}
      <div className="mb-6 space-y-3">
        {/* Tier 1 — order group */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {GROUPS.map((g) => {
            const active = group === g.key;
            const count = countForStatuses(g.statuses);
            return (
              <button
                key={g.key}
                onClick={() => selectGroup(g.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {g.label}
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    active ? "text-primary/70" : "text-gray-400"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tier 2 — status within the group */}
        {SUB_FILTERS[group].length > 0 && (
          <div className="overflow-x-auto pb-1">
            <nav className="flex min-w-max gap-1.5">
              {SUB_FILTERS[group].map((s) => {
                const active = sub === s.key;
                const count = countForStatuses(s.statuses);
                return (
                  <button
                    key={s.key}
                    onClick={() => setSub(s.key)}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    )}
                  >
                    {s.label}
                    {count > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-xs font-semibold tabular-nums",
                          active ? "bg-white/20 text-white" : "bg-white text-gray-500"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No orders in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetail={setSelectedOrderId}
            />
          ))}
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          spaceId={spaceId}
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
};
