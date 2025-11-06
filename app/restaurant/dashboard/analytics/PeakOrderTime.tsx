// components/restaurant-dashboard/analytics/PeakOrderTimes.tsx
"use client";

import { PeakOrderTime } from "@/types/restaurant.types";

interface PeakOrderTimesProps {
  times: PeakOrderTime[];
}

export const PeakOrderTimes = ({ times }: PeakOrderTimesProps) => {
  if (!times || times.length === 0) {
    return null;
  }

  const maxCount = Math.max(...times.map((t) => t.orderCount));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4">
        Peak Order Times (Corporate)
      </h4>
      <div className="space-y-2">
        {times.slice(0, 5).map((time, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-900">
              {time.hour}:00 - {time.hour + 1}:00
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{
                    width: `${(time.orderCount / maxCount) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                {time.orderCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};