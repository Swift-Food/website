"use client";

import { useState, useEffect } from "react";
import { Loader, AlertCircle, TrendingUp, Percent, Building2, ShoppingBag } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";
import { CoworkingMetrics as MetricsType } from "@/types/api/coworking.api.types";

interface Props {
  spaceId: string;
}

const fmt = (n: number) => `£${Number(n).toFixed(2)}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

const MetricCard = ({ icon, label, value, sub, accent = "indigo" }: MetricCardProps) => {
  const accentClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${accentClasses[accent] ?? accentClasses.indigo}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
};

// Task 7 — Financial metrics panel for coworking admins
export const CoworkingMetrics = ({ spaceId }: Props) => {
  const [metrics, setMetrics] = useState<MetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    coworkingApi
      .getMetrics(spaceId)
      .then(setMetrics)
      .catch((err) => setError(err.message || "Failed to load metrics"))
      .finally(() => setLoading(false));
  }, [spaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader size={24} className="animate-spin text-indigo-600" />
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

  if (!metrics) return null;

  return (
    <div className="space-y-5">
      {/* Period header */}
      <div className="text-sm text-gray-500">
        Period: <span className="font-medium text-gray-700">{fmtDate(metrics.periodStart)}</span>
        {" "}–{" "}
        <span className="font-medium text-gray-700">{fmtDate(metrics.periodEnd)}</span>
      </div>

      {/* Metric cards — 2×2 on mobile, 4-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Total Revenue"
          value={fmt(metrics.totalRevenue)}
          sub="All confirmed orders"
          accent="indigo"
        />

        {/* Task 7 — Service Fee revenue metric */}
        <MetricCard
          icon={<Percent size={20} />}
          label="Service Fee Revenue"
          value={fmt(metrics.serviceFeeRevenue)}
          sub="Catering commission earnings"
          accent="green"
        />

        <MetricCard
          icon={<Building2 size={20} />}
          label="Venue Hire Revenue"
          value={fmt(metrics.venueHireRevenue)}
          sub="Space hire fees collected"
          accent="blue"
        />

        <MetricCard
          icon={<ShoppingBag size={20} />}
          label="Total Orders"
          value={String(metrics.totalOrders)}
          sub={`${metrics.confirmedOrders} confirmed`}
          accent="purple"
        />
      </div>

      {/* Revenue breakdown bar */}
      {metrics.totalRevenue > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Revenue Breakdown</h4>
          <div className="space-y-3">
            {[
              {
                label: "Food & Catering",
                value: metrics.totalRevenue - metrics.serviceFeeRevenue - metrics.venueHireRevenue,
                color: "bg-indigo-400",
              },
              { label: "Service Fee", value: metrics.serviceFeeRevenue, color: "bg-green-400" },
              { label: "Venue Hire", value: metrics.venueHireRevenue, color: "bg-blue-400" },
            ].map((item) => {
              const pct = metrics.totalRevenue > 0 ? (item.value / metrics.totalRevenue) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">
                      {fmt(item.value)}{" "}
                      <span className="text-gray-400">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Average order value */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Average Order Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{fmt(metrics.averageOrderValue)}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{metrics.confirmedOrders} confirmed orders</p>
          <p>out of {metrics.totalOrders} total</p>
        </div>
      </div>
    </div>
  );
};
