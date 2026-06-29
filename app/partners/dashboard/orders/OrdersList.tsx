"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";
import { DashboardOrderSummary } from "@/types/api/coworking.api.types";
import { OrderCard } from "./OrderCard";
import { OrderDetailModal } from "./OrderDetailModal";

interface Props {
  spaceId: string;
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "admin_reviewed", label: "Pending Review" },
  { key: "restaurant_reviewed", label: "Awaiting Payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const OrdersList = ({ spaceId }: Props) => {
  const [orders, setOrders] = useState<DashboardOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
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

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    // "confirmed" tab includes both paid and confirmed statuses
    if (activeTab === "confirmed") {
      return orders.filter((o) => o.status === "paid" || o.status === "confirmed");
    }
    // "restaurant_reviewed" tab includes payment_link_sent too
    if (activeTab === "restaurant_reviewed") {
      return orders.filter(
        (o) => o.status === "restaurant_reviewed" || o.status === "payment_link_sent"
      );
    }
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const countForTab = (key: string) => {
    if (key === "all") return orders.length;
    if (key === "confirmed") return orders.filter((o) => o.status === "paid" || o.status === "confirmed").length;
    if (key === "restaurant_reviewed") return orders.filter((o) => o.status === "restaurant_reviewed" || o.status === "payment_link_sent").length;
    return orders.filter((o) => o.status === key).length;
  };

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
      {/* Status filter */}
      <div className="mb-6 overflow-x-auto pb-1">
        <nav className="flex min-w-max gap-1.5">
          {STATUS_TABS.map((tab) => {
            const count = countForTab(tab.key);
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                      active ? "bg-white/20 text-white" : "bg-white text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No orders in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
