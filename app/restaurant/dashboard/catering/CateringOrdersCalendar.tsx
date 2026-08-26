"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Calendar status buckets. Cancelled has no bucket on purpose — cancelled
 *  orders are excluded from the calendar entirely. */
export type CalendarBucket =
  | "pending_review"
  | "awaiting_payment"
  | "confirmed"
  | "completed";

const BUCKET_OF_STATUS: Record<string, CalendarBucket> = {
  pending_review: "pending_review",
  admin_reviewed: "pending_review",
  restaurant_reviewed: "awaiting_payment",
  payment_link_sent: "awaiting_payment",
  paid: "confirmed",
  confirmed: "confirmed",
  completed: "completed",
};

/** Shared colour language for the calendar legend, day chips and status badges. */
export const BUCKET_STYLES: Record<
  CalendarBucket,
  { label: string; dot: string; badge: string }
> = {
  pending_review: {
    label: "Pending Review",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-green-600",
    badge: "bg-green-50 text-green-700",
  },
  completed: {
    label: "Completed",
    dot: "bg-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
};

/** Legend order, also the order counts appear in inside a day cell. */
const BUCKETS = (
  ["pending_review", "awaiting_payment", "confirmed", "completed"] as const
).map((key) => ({ key, ...BUCKET_STYLES[key] }));

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

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/** Bucket for a status, or null when the order should not appear on the calendar. */
export const bucketForStatus = (status: string): CalendarBucket | null =>
  BUCKET_OF_STATUS[status] ?? null;

interface CalendarEntry {
  eventDate: string | Date;
  status: string;
}

interface Props<T extends CalendarEntry> {
  orders: T[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
}

interface Cell {
  dateKey: string;
  day: number;
  inMonth: boolean;
}

/** Full weeks (Monday-first) covering the given month, incl. adjacent-month days. */
const buildCells = (year: number, month: number): Cell[] => {
  // getDay(): 0 = Sunday. Shift so Monday is column 0.
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, i) => {
    const d = new Date(year, month, 1 - lead + i);
    return {
      dateKey: toDateKey(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    };
  });
};

export const CateringOrdersCalendar = <T extends CalendarEntry>({
  orders,
  selectedDate,
  onSelectDate,
}: Props<T>) => {
  const today = new Date();
  const todayKey = toDateKey(today);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  /** date key -> bucket counts. Cancelled orders never make it in. */
  const countsByDate = useMemo(() => {
    const map: Record<string, Record<CalendarBucket, number>> = {};
    for (const order of orders) {
      const bucket = bucketForStatus(order.status);
      if (!bucket || !order.eventDate) continue;
      const key = toDateKey(new Date(order.eventDate));
      map[key] ??= {
        pending_review: 0,
        awaiting_payment: 0,
        confirmed: 0,
        completed: 0,
      };
      map[key][bucket] += 1;
    }
    return map;
  }, [orders]);

  const cells = useMemo(() => buildCells(year, month), [year, month]);

  const goPrev = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };

  const goNext = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    onSelectDate(todayKey);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-base sm:text-lg font-bold text-gray-900">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            aria-label="Previous month"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToday}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goNext}
            aria-label="Next month"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((cell) => {
          const counts = countsByDate[cell.dateKey];
          const hasOrders = !!counts;
          const isToday = cell.dateKey === todayKey;
          const isSelected = cell.dateKey === selectedDate;

          return (
            <button
              key={cell.dateKey}
              onClick={() => onSelectDate(isSelected ? null : cell.dateKey)}
              aria-current={isToday ? "date" : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-xl border p-1 min-h-[46px] sm:min-h-[52px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : hasOrders
                  ? "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                  : "border-transparent hover:border-gray-200 hover:bg-gray-50"
              } ${cell.inMonth ? "" : "opacity-40"}`}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-semibold ${
                  isToday && !isSelected
                    ? "bg-blue-600 text-white"
                    : isSelected
                    ? "text-blue-700"
                    : cell.inMonth
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {cell.day}
              </span>

              {counts && (
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {BUCKETS.filter((b) => counts[b.key] > 0).map((b) => (
                    <span
                      key={b.key}
                      title={`${counts[b.key]} ${b.label}`}
                      className={`h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${b.dot}`}
                    >
                      {counts[b.key]}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
        {BUCKETS.map((b) => (
          <span
            key={b.key}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${b.dot}`} />
            {b.label}
          </span>
        ))}
        <span className="text-xs text-gray-400">Cancelled orders are hidden</span>
      </div>
    </div>
  );
};
