"use client";

import { Fragment, useEffect, useState } from "react";
import { CateringOrderStatus } from "@/types/catering.types";
import { CateringOrderStatus as ApiCateringOrderStatus } from "@/types/api";
import {
  Clock,
  Search,
  CheckCircle2,
  CreditCard,
  Package,
  XCircle,
  Check,
  ClipboardList,
} from "lucide-react";

interface OrderStatusTimelineProps {
  status: CateringOrderStatus | ApiCateringOrderStatus;
}

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const timelineSteps = [
    { keys: [CateringOrderStatus.PENDING_REVIEW], label: "Submitted", icon: Clock },
    { keys: [CateringOrderStatus.ADMIN_REVIEWED, CateringOrderStatus.RESTAURANT_REVIEWED], label: "Reviewing", icon: Search },
    { keys: [CateringOrderStatus.PAYMENT_LINK_SENT], label: "Payment", icon: CreditCard },
    { keys: [CateringOrderStatus.PAID, CateringOrderStatus.CONFIRMED], label: "Confirmed", icon: CheckCircle2 },
    { keys: [CateringOrderStatus.COMPLETED], label: "Delivered", icon: Package },
  ];

  const statusIndex = timelineSteps.findIndex((step) => step.keys.includes(status as CateringOrderStatus));
  const isCancelled = status === CateringOrderStatus.CANCELLED;
  const isAllDone = !isCancelled && statusIndex === timelineSteps.length - 1;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-pink-100 p-2">
          <ClipboardList className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Order Progress</h3>
          <p className="text-sm text-gray-500">Track your order status</p>
        </div>
      </div>

      <style>{`
        @keyframes otl-pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      <div className="relative py-2">
        {/* Track row: nodes (fixed width) with flex-1 segments between them */}
        <div className="flex items-center">
          {timelineSteps.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = !isCancelled && (i < statusIndex || isAllDone);
            const isActive = !isCancelled && !isAllDone && i === statusIndex;
            const isFuture = isCancelled ? true : i > statusIndex;
            // Segment i (between node i-1 and node i) is filled when node i
            // is completed or active, i.e. i <= statusIndex.
            const isSegmentFilled = !isCancelled && i <= statusIndex;

            return (
              <Fragment key={step.keys[0]}>
                {i > 0 && (
                  <div className="flex-1 h-1 mx-1 sm:mx-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full origin-left rounded-full bg-primary transition-transform duration-200 ease-linear ${
                        isCancelled ? "" : "shadow-[0_0_10px] shadow-primary/40"
                      }`}
                      style={{
                        transform:
                          mounted && isSegmentFilled ? "scaleX(1)" : "scaleX(0)",
                        // Each segment waits for the previous one to fully complete
                        // (duration is 200ms, so delay = (i-1) * 200ms).
                        transitionDelay: `${(i - 1) * 0.2}s`,
                      }}
                    />
                  </div>
                )}

                {/* Node */}
                <div className="relative flex items-center justify-center w-9 sm:w-12 h-11 sm:h-14 shrink-0">
                  {isActive && (
                    <div
                      className="absolute w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-primary opacity-45 pointer-events-none"
                      style={{ animation: "otl-pulse-ring 2s ease-out infinite" }}
                    />
                  )}
                  <div
                    className={`relative z-10 flex items-center justify-center rounded-full border-2 sm:border-[2.5px] transition-all ${
                      isActive
                        ? "w-9 h-9 sm:w-11 sm:h-11"
                        : "w-8 h-8 sm:w-[38px] sm:h-[38px]"
                    } ${
                      isCompleted
                        ? "bg-primary border-primary shadow-md shadow-primary/30"
                        : isFuture
                          ? "bg-white border-gray-300"
                          : "bg-white border-primary"
                    } ${isActive ? "ring-2 sm:ring-4 ring-primary/30" : ""}`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={2.8} />
                    ) : (
                      <Icon
                        strokeWidth={1.8}
                        className={`w-3 h-3 sm:w-[15px] sm:h-[15px] ${isFuture ? "text-gray-400" : "text-primary"}`}
                      />
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        {/* Labels row: mirrors the track structure so labels align with node centers */}
        <div className="flex items-start mt-1.5">
          {timelineSteps.map((step, i) => {
            const isCompleted = !isCancelled && (i < statusIndex || isAllDone);
            const isActive = !isCancelled && !isAllDone && i === statusIndex;
            const isFuture = isCancelled ? true : i > statusIndex;

            return (
              <Fragment key={step.keys[0]}>
                {i > 0 && <div className="flex-1 mx-1 sm:mx-1.5" />}
                <div className="w-9 sm:w-12 shrink-0 flex flex-col items-center gap-1">
                  <span
                    className={`text-[9px] sm:text-[11px] leading-tight tracking-wide whitespace-nowrap text-center ${
                      isFuture
                        ? "text-gray-400 font-medium"
                        : isActive
                          ? "text-primary font-bold"
                          : isCompleted
                            ? "text-gray-900 font-semibold"
                            : "text-gray-500 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-[8px] sm:text-[9px] font-semibold text-primary bg-primary/10 border border-primary/30 px-1.5 py-px rounded-full whitespace-nowrap">
                      now
                    </span>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>

        {isCancelled && (
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Order Cancelled
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
