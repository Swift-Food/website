"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { coworkingApi } from "@/services/api/coworking.api";
import {
  CalendarDay,
  CalendarOrderItem,
} from "@/types/api/coworking.api.types";
import { OrderDetailModal } from "../orders/OrderDetailModal";

interface Props {
  spaceId: string;
}

const fmt = (n: number) => `£${Number(n).toFixed(2)}`;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_DOTS: Record<string, string> = {
  confirmed: "bg-emerald-500",
  paid: "bg-emerald-500",
  completed: "bg-gray-400",
  cancelled: "bg-rose-400",
  restaurant_reviewed: "bg-blue-400",
  payment_link_sent: "bg-blue-400",
  admin_reviewed: "bg-amber-400",
  pending_review: "bg-amber-400",
};

const STATUS_BADGES: Record<string, string> = {
  pending_review: "bg-amber-50 text-amber-700",
  admin_reviewed: "bg-amber-50 text-amber-700",
  restaurant_reviewed: "bg-blue-50 text-blue-700",
  payment_link_sent: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  completed: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending",
  admin_reviewed: "Under Review",
  restaurant_reviewed: "Awaiting Payment",
  payment_link_sent: "Link Sent",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const fmtDateLong = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

/* ── Right panel: events for the selected day ───────────────────────── */

interface EventCardProps {
  order: CalendarOrderItem;
  onSelect: (orderId: string) => void;
}

const EventCard = ({ order, onSelect }: EventCardProps) => (
  <button
    onClick={() => onSelect(order.id)}
    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <div className="mb-2 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {order.customerName}
        </p>
        <p className="truncate text-xs text-gray-500">{order.customerEmail}</p>
        {order.eventTime && (
          <p className="mt-0.5 text-xs font-medium text-gray-400">
            {order.eventTime}
          </p>
        )}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          STATUS_BADGES[order.status] ?? "bg-gray-100 text-gray-600",
        )}
      >
        {STATUS_LABELS[order.status] ?? order.status}
      </span>
    </div>

    <div className="space-y-0.5 border-t border-gray-100 pt-2 text-xs">
      {order.deliveryFee > 0 && (
        <div className="flex justify-between text-gray-500">
          <span>Delivery</span>
          <span>{fmt(order.deliveryFee)}</span>
        </div>
      )}
      {order.serviceFee > 0 && (
        <div className="flex justify-between text-primary">
          <span>Commission fee</span>
          <span>{fmt(order.serviceFee)}</span>
        </div>
      )}
      <div className="flex justify-between pt-0.5 font-semibold text-gray-900">
        <span>Total</span>
        <span>{fmt(order.finalTotal)}</span>
      </div>
    </div>
  </button>
);

interface DayPanelProps {
  selectedDate: string | null;
  orders: CalendarOrderItem[];
  onSelect: (orderId: string) => void;
}

const DayPanel = ({ selectedDate, orders, onSelect }: DayPanelProps) => {
  if (!selectedDate) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <CalendarDays size={26} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Select a date</p>
        <p className="text-xs text-gray-400">
          Pick a day on the calendar to see its events.
        </p>
      </div>
    );
  }

  const total = orders.reduce((sum, o) => sum + Number(o.finalTotal || 0), 0);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 px-0 py-3.5 sm:px-4">
        <p className="text-sm font-semibold tracking-tight text-gray-900">
          {fmtDateLong(selectedDate)}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {orders.length === 0
            ? "No events scheduled"
            : `${orders.length} event${orders.length !== 1 ? "s" : ""} · ${fmt(total)}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <CalendarDays size={24} className="text-gray-300" />
          <p className="text-xs text-gray-400">Nothing booked for this day.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto px-0 py-4 sm:p-4">
          {orders.map((o) => (
            <EventCard key={o.id} order={o} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Calendar ───────────────────────────────────────────────────────── */

export const CoworkingCalendar = ({ spaceId }: Props) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchCalendar = () => {
    setLoading(true);
    setError("");
    coworkingApi
      .getCalendar(spaceId)
      .then(setCalendarDays)
      .catch((err) => setError(err.message || "Failed to load calendar"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalendar();
  }, [spaceId]);

  const prev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };

  const next = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };

  // Lookup: date string → orders
  const ordersByDate = useMemo(() => {
    const map: Record<string, CalendarOrderItem[]> = {};
    calendarDays.forEach((day) => {
      map[day.date] = day.orders;
    });
    return map;
  }, [calendarDays]);

  // Grid cells for the month (Monday-first), padded with adjacent-month days
  // so the 6-row grid is always full and visually continuous.
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const pad = (n: number) => String(n).padStart(2, "0");
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const daysInPrev = new Date(year, month - 1, 0).getDate();

  type Cell = {
    day: number;
    mo: number;
    yr: number;
    dateStr: string;
    inMonth: boolean;
  };
  const cells: Cell[] = [];
  for (let i = startOffset; i > 0; i--) {
    const day = daysInPrev - i + 1;
    cells.push({
      day,
      mo: prevMonth,
      yr: prevYear,
      dateStr: `${prevYear}-${pad(prevMonth)}-${pad(day)}`,
      inMonth: false,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      mo: month,
      yr: year,
      dateStr: `${year}-${pad(month)}-${pad(day)}`,
      inMonth: true,
    });
  }
  for (let day = 1; cells.length < 42; day++) {
    cells.push({
      day,
      mo: nextMonth,
      yr: nextYear,
      dateStr: `${nextYear}-${pad(nextMonth)}-${pad(day)}`,
      inMonth: false,
    });
  }

  const selectedOrders = selectedDate ? (ordersByDate[selectedDate] ?? []) : [];

  // Summary for the visible month
  const monthPrefix = `${year}-${pad(month)}`;
  const monthStats = calendarDays.reduce(
    (acc, d) => {
      if (!d.date.startsWith(monthPrefix)) return acc;
      acc.events += d.orders.length;
      acc.revenue += d.orders.reduce(
        (s, o) => s + Number(o.finalTotal || 0),
        0,
      );
      return acc;
    },
    { events: 0, revenue: 0 },
  );

  const goToDate = (c: Cell) => {
    setYear(c.yr);
    setMonth(c.mo);
    setSelectedDate(c.dateStr);
  };

  return (
    <div className="border-x-0 border-y border-gray-200/80 bg-white p-4 shadow-sm shadow-gray-200/50 sm:rounded-2xl sm:border-x sm:p-6">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Calendar */}
          <div>
            {/* Month navigation */}
            <div className="mb-3 flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-gray-900">
                  {MONTH_NAMES[month - 1]} {year}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  {monthStats.events === 0
                    ? "No events this month"
                    : `${monthStats.events} event${monthStats.events !== 1 ? "s" : ""} · ${fmt(monthStats.revenue)}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={prev}
                  aria-label="Previous month"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    setYear(today.getFullYear());
                    setMonth(today.getMonth() + 1);
                    setSelectedDate(todayStr);
                  }}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Today
                </button>
                <button
                  onClick={next}
                  aria-label="Next month"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((cell, idx) => {
                const orders = ordersByDate[cell.dateStr] ?? [];
                const hasOrders = orders.length > 0;
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDate;

                return (
                  <button
                    key={idx}
                    onClick={() => goToDate(cell)}
                    aria-current={isToday ? "date" : undefined}
                    className={cn(
                      "group relative flex min-h-[92px] flex-col items-center justify-start gap-1 rounded-xl border p-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : hasOrders && cell.inMonth
                          ? "border-gray-200 bg-gray-50/70 hover:border-gray-300 hover:bg-gray-100/70"
                          : "border-transparent hover:border-gray-200 hover:bg-gray-50",
                      !cell.inMonth && "opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                        isToday && !isSelected && "bg-primary text-white",
                        isSelected && "text-primary",
                        !isToday &&
                          !isSelected &&
                          (cell.inMonth ? "text-gray-700" : "text-gray-400"),
                      )}
                    >
                      {cell.day}
                    </span>

                    {/* Status dots — desktop only */}
                    {hasOrders && (
                      <div className="hidden flex-wrap items-center justify-center gap-1 sm:flex">
                        {orders.slice(0, 4).map((o, i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              STATUS_DOTS[o.status] ?? "bg-gray-400",
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Mobile: just the count, no dots */}
                    {hasOrders && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-white sm:hidden">
                        {orders.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status legend — desktop only */}
            <div className="mt-4 hidden flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-gray-100 pt-3 sm:flex">
              {[
                { label: "Confirmed / Paid", dot: "bg-emerald-500" },
                { label: "In progress", dot: "bg-blue-400" },
                { label: "Pending", dot: "bg-amber-400" },
                { label: "Cancelled", dot: "bg-rose-400" },
                { label: "Completed", dot: "bg-gray-400" },
              ].map((l) => (
                <span
                  key={l.label}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500"
                >
                  <span className={cn("h-2 w-2 rounded-full", l.dot)} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Selected-day events — flat on mobile, carded on larger screens */}
          <div className="border-t border-gray-200 bg-transparent sm:min-h-[360px] sm:rounded-2xl sm:border sm:bg-gray-50/60 lg:min-h-0">
            <DayPanel
              selectedDate={selectedDate}
              orders={selectedOrders}
              onSelect={setSelectedOrderId}
            />
          </div>
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
