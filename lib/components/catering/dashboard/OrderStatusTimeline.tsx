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
    { keys: [CateringOrderStatus.PENDING_REVIEW], label: "Submitted", desc: "Order received and logged", icon: Clock },
    { keys: [CateringOrderStatus.ADMIN_REVIEWED, CateringOrderStatus.RESTAURANT_REVIEWED], label: "Reviewing", desc: "Our team is reviewing your order", icon: Search },
    { keys: [CateringOrderStatus.PAYMENT_LINK_SENT], label: "Payment", desc: "Payment processed successfully", icon: CreditCard },
    { keys: [CateringOrderStatus.PAID, CateringOrderStatus.CONFIRMED], label: "Confirmed", desc: "Order confirmed by kitchen", icon: CheckCircle2 },
    { keys: [CateringOrderStatus.COMPLETED], label: "Delivered", desc: "Delivered to your address", icon: Package },
  ];

  const statusIndex = timelineSteps.findIndex((step) => step.keys.includes(status as CateringOrderStatus));
  const isCancelled = status === CateringOrderStatus.CANCELLED;
  const isAllDone = !isCancelled && statusIndex === timelineSteps.length - 1;

  // Truck-bar progress: 0% at first step → 100% at last step.
  const safeIndex = Math.max(0, Math.min(statusIndex, timelineSteps.length - 1));
  const truckPct = isCancelled
    ? 0
    : (safeIndex / (timelineSteps.length - 1)) * 100;
  // Total animation duration scales with how many segments we cross.
  const segMs = 1000;
  const truckDurationMs = Math.max(1, safeIndex) * segMs;

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

      {/* Vertical timeline (mobile only) */}
      <div className="block sm:hidden">
        {timelineSteps.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = !isCancelled && (i < statusIndex || isAllDone);
          const isActive = !isCancelled && !isAllDone && i === statusIndex;
          const isFuture = isCancelled ? true : i > statusIndex;
          const isLast = i === timelineSteps.length - 1;
          // Line below node i is filled when node i+1 is reached.
          const isLineFilled = !isCancelled && (i < statusIndex || isAllDone);

          return (
            <div key={step.keys[0]} className="flex gap-3.5">
              {/* Left: node + connecting line */}
              <div className="flex flex-col items-center w-9 shrink-0">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  {isActive && (
                    <div
                      className="absolute w-9 h-9 rounded-full border-2 border-primary opacity-45 pointer-events-none"
                      style={{ animation: "otl-pulse-ring 2s ease-out infinite" }}
                    />
                  )}
                  <div
                    className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all ${
                      isCompleted
                        ? "bg-primary border-primary shadow-md shadow-primary/30"
                        : isFuture
                          ? "bg-white border-gray-300"
                          : "bg-white border-primary"
                    } ${isActive ? "ring-4 ring-primary/30" : ""}`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={2.8} />
                    ) : (
                      <Icon
                        strokeWidth={1.8}
                        className={`w-4 h-4 ${isFuture ? "text-gray-400" : "text-primary"}`}
                      />
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div className="flex-1 w-0.5 my-1 min-h-7 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="w-full h-full origin-top rounded-full bg-primary transition-transform ease-linear"
                      style={{
                        transform:
                          mounted && isLineFilled ? "scaleY(1)" : "scaleY(0)",
                        transitionDuration: `${segMs}ms`,
                        transitionDelay: `${i * segMs}ms`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Right: label + description */}
              <div className={`pt-1 ${isLast ? "" : "pb-5"}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm leading-tight ${
                      isFuture
                        ? "text-gray-400 font-medium"
                        : isActive
                          ? "text-gray-900 font-bold"
                          : isCompleted
                            ? "text-gray-900 font-semibold"
                            : "text-gray-900 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                      In Progress
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isFuture ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
        {isCancelled && (
          <div className="flex items-center gap-2 mt-2 px-3.5 py-2.5 rounded-lg bg-primary/10 border border-primary/30">
            <XCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-[13px] font-semibold text-primary">
              Order Cancelled
            </span>
          </div>
        )}
      </div>

      {/* Horizontal timeline (sm and up) */}
      <div className="relative py-2 hidden sm:block">
        {/*
          Single continuous bar + truck overlay. Both the bar's fill width
          and the truck's left use the SAME percentage of the outer
          container width with the SAME px-offset math, so they interpolate
          in perfect lockstep regardless of container size:
            bar_right_x  = 24 + (p% - p*0.48px + 28px) = p% - p*0.48px + 52px
            truck_left_x = p% + 14px - p*0.48px + 38px = p% - p*0.48px + 52px
          → bar_right_x = truck_left_x (bar meets the back of the truck).
        */}
        <div className="relative">
          {/* Background bar — spans node-0 center (24px from left) to last
              node center (24px from right). */}
          <div
            className="absolute h-1 rounded-full bg-gray-200"
            style={{ top: "calc(50% - 2px)", left: 24, right: 24 }}
          />
          {/* Filled bar */}
          {!isCancelled && (
            <div
              className="absolute h-1 rounded-full bg-primary ease-linear shadow-[0_0_10px] shadow-primary/40"
              style={{
                top: "calc(50% - 2px)",
                left: 24,
                width: `calc(${mounted ? truckPct : 0}% - ${
                  (mounted ? truckPct : 0) * 0.48
                }px + 28px)`,
                transitionProperty: "width",
                transitionDuration: `${truckDurationMs}ms`,
              }}
            />
          )}
          {/* Truck — z-0 so node circles (z-10) cover it as it slides under. */}
          {!isCancelled && (
            <div
              className="absolute z-0 pointer-events-none ease-linear"
              style={{
                top: "calc(50% - 10px)",
                left: `calc(${mounted ? truckPct : 0}% + ${
                  14 - (mounted ? truckPct : 0) * 0.48 + 38
                }px)`,
                transitionProperty: "left",
                transitionDuration: `${truckDurationMs}ms`,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-primary drop-shadow-[0_0_8px_var(--color-primary)]"
              >
                <path
                  d="M16 3H1v13h15V3zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          {/* Node row — flex layout with pure spacers. Nodes overlay the bar. */}
          <div className="flex items-center">
            {timelineSteps.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = !isCancelled && (i < statusIndex || isAllDone);
              const isActive = !isCancelled && !isAllDone && i === statusIndex;
              const isFuture = isCancelled ? true : i > statusIndex;

              return (
                <Fragment key={step.keys[0]}>
                  {i > 0 && <div className="flex-1 mx-1 sm:mx-1.5" />}
                  {/* Node */}
                  <div className="relative z-10 flex items-center justify-center w-9 sm:w-12 h-11 sm:h-14 shrink-0">
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
