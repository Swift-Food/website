"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader, AlertCircle } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";
import { CalendarDay, CalendarOrderItem } from "@/types/api/coworking.api.types";

interface Props {
  spaceId: string;
}

const fmt = (n: number) => `£${Number(n).toFixed(2)}`;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_DOTS: Record<string, string> = {
  confirmed: "bg-green-500",
  paid: "bg-green-500",
  completed: "bg-gray-400",
  cancelled: "bg-red-400",
  restaurant_reviewed: "bg-blue-400",
  payment_link_sent: "bg-blue-400",
  admin_reviewed: "bg-yellow-400",
  pending_review: "bg-yellow-400",
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

interface DayPopoverProps {
  orders: CalendarOrderItem[];
  onClose: () => void;
}

const DayPopover = ({ orders, onClose }: DayPopoverProps) => (
  <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3">
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
    >
      ×
    </button>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
      {orders.length} order{orders.length !== 1 ? "s" : ""}
    </p>
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {orders.map((o) => (
        <div key={o.id} className="bg-gray-50 rounded-lg p-2.5 text-xs">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{o.customerName}</p>
              <p className="text-gray-500 truncate">{o.customerEmail}</p>
              <p className="text-gray-500">{o.eventTime}</p>
            </div>
            <span
              className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${
                STATUS_DOTS[o.status] ?? "bg-gray-400"
              }`}
            />
          </div>

          {/* Task 5 — Service fee in calendar popover */}
          <div className="space-y-0.5 border-t border-gray-200 pt-1.5">
            {o.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{fmt(o.deliveryFee)}</span>
              </div>
            )}
            {o.serviceFee > 0 && (
              <div className="flex justify-between text-primary">
                <span>Service Fee</span>
                <span>{fmt(o.serviceFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{fmt(o.finalTotal)}</span>
            </div>
          </div>

          <div className="mt-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                STATUS_DOTS[o.status]
                  ? `bg-opacity-10 text-gray-700`
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUS_LABELS[o.status] ?? o.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CoworkingCalendar = ({ spaceId }: Props) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openPopoverDate, setOpenPopoverDate] = useState<string | null>(null);

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
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const next = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  // Build a lookup: date string → orders
  const ordersByDate: Record<string, CalendarOrderItem[]> = {};
  calendarDays.forEach((day) => {
    ordersByDate[day.date] = day.orders;
  });

  // Grid cells for the month
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  // Shift so Monday = first column (Sun gets pushed to column 7)
  const startOffset = (firstDay + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prev}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <button
          onClick={next}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size={24} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={idx} className="bg-gray-50 min-h-[80px]" />;
              }

              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const orders = ordersByDate[dateStr] ?? [];
              const hasOrders = orders.length > 0;
              const isToday = dateStr === todayStr;
              const isPopoverOpen = openPopoverDate === dateStr;

              return (
                <div
                  key={idx}
                  className={`relative bg-white min-h-[80px] p-1.5 ${
                    hasOrders ? "cursor-pointer hover:bg-primary/10 transition-colors" : ""
                  }`}
                  onClick={() => hasOrders && setOpenPopoverDate(isPopoverOpen ? null : dateStr)}
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                      isToday
                        ? "bg-primary text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>

                  {hasOrders && (
                    <div className="mt-1 space-y-0.5">
                      {orders.slice(0, 2).map((o, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 text-[10px] text-gray-700 bg-primary/10 rounded px-1 py-0.5 truncate"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOTS[o.status] ?? "bg-gray-400"}`} />
                          <span className="truncate">{o.customerName}</span>
                        </div>
                      ))}
                      {orders.length > 2 && (
                        <p className="text-[10px] text-primary/70 pl-1">+{orders.length - 2} more</p>
                      )}
                    </div>
                  )}

                  {isPopoverOpen && (
                    <DayPopover
                      orders={orders}
                      onClose={() => setOpenPopoverDate(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
