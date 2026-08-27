// components/restaurant-dashboard/withdrawals/EarlyWithdrawal.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, Loader, Zap } from "lucide-react";
import { restaurantApi } from "@/services/api/restaurant.api";
import {
  EarlyWithdrawalEligibility,
  EarlyWithdrawalOrder,
} from "@/types/restaurant.types";

interface EarlyWithdrawalProps {
  restaurantUserId: string;
  accountId: string;
  onSuccess: () => void;
}

const money = (n: number) => `£${n.toFixed(2)}`;

const shortDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export const EarlyWithdrawal = ({
  restaurantUserId,
  accountId,
  onSuccess,
}: EarlyWithdrawalProps) => {
  const [eligibility, setEligibility] =
    useState<EarlyWithdrawalEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiAccountId = accountId === "legacy" ? undefined : accountId;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await restaurantApi.getEarlyWithdrawalEligibility(
        restaurantUserId,
        apiAccountId
      );
      setEligibility(data);
      // Start with every order that can be withdrawn ticked
      setSelected(
        new Set(
          (data?.orders ?? [])
            .filter((o) => o.fundsAvailable)
            .map((o) => o.orderId)
        )
      );
    } catch (err: any) {
      setError(err.message || "Could not load your orders");
    } finally {
      setLoading(false);
    }
  }, [restaurantUserId, apiAccountId]);

  useEffect(() => {
    load();
  }, [load]);

  const orders = eligibility?.orders ?? [];
  const available = useMemo(
    () => orders.filter((o) => o.fundsAvailable),
    [orders]
  );
  const waiting = useMemo(
    () => orders.filter((o) => !o.fundsAvailable),
    [orders]
  );
  const chosen = available.filter((o) => selected.has(o.orderId));
  const totals = chosen.reduce(
    (acc, o) => ({
      earnings: acc.earnings + o.earnings,
      fees: acc.fees + o.processingFee,
      receive: acc.receive + o.youReceive,
    }),
    { earnings: 0, fees: 0, receive: 0 }
  );
  const minimumNet = eligibility?.minimumNet ?? 10;
  const belowMinimum = chosen.length > 0 && totals.receive < minimumNet;
  const latestFreeDate = chosen
    .map((o) => o.scheduledTransferDate)
    .filter(Boolean)
    .sort()
    .at(-1) as string | undefined;

  const toggle = (orderId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      chosen.length === available.length
        ? new Set()
        : new Set(available.map((o) => o.orderId))
    );
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await restaurantApi.requestEarlyWithdrawal({
        userId: restaurantUserId,
        accountId: apiAccountId,
        orderIds: chosen.map((o) => o.orderId),
      });
      setConfirming(false);
      if (result.status === "failed") {
        setError(
          result.rejectionReason ||
            "The withdrawal could not be completed. Please try again."
        );
      } else {
        setSuccess(
          `Done. ${money(Number(result.netAmount))} is on its way to your bank account. It usually arrives in 1 to 3 working days.`
        );
      }
      await load();
      onSuccess();
    } catch (err: any) {
      setConfirming(false);
      setError(err.message || "The withdrawal could not be completed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Zap size={20} className="mr-2 text-amber-500" />
          Get paid early
        </h2>
        {available.length > 0 && (
          <span className="text-sm font-medium text-gray-700 bg-gray-100 rounded-full px-3 py-1 whitespace-nowrap">
            {money(available.reduce((s, o) => s + o.earnings, 0))} waiting
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        Swift sends your earnings to your Stripe balance 5 days after the
        customer pays. This is free, and Swift pays the card processing fee.
        If you need the money sooner, you can withdraw early. When you
        withdraw early, you pay the card processing fee for that order instead
        of Swift.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-700">
          <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center text-gray-500 text-sm py-6">
          <Loader size={16} className="mr-2 animate-spin" />
          Checking your orders...
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">
          No orders are waiting to be paid. When a customer pays for an order,
          it appears here.
        </p>
      ) : (
        <>
          {available.length > 0 && (
            <div className="overflow-x-auto -mx-2">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                    <th className="px-2 py-2 w-8">
                      <input
                        type="checkbox"
                        aria-label="Select all orders"
                        checked={
                          chosen.length === available.length &&
                          available.length > 0
                        }
                        onChange={toggleAll}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </th>
                    <th className="px-2 py-2">Order</th>
                    <th className="px-2 py-2 text-right">Your earnings</th>
                    <th className="px-2 py-2 text-right">Card fee</th>
                    <th className="px-2 py-2 text-right">You receive</th>
                    <th className="px-2 py-2 text-right">Free on</th>
                  </tr>
                </thead>
                <tbody>
                  {available.map((o) => (
                    <OrderRow
                      key={o.orderId}
                      order={o}
                      checked={selected.has(o.orderId)}
                      onToggle={() => toggle(o.orderId)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {waiting.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center">
                <Clock size={12} className="mr-1" />
                Not ready yet
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                {waiting.map((o) => (
                  <li key={o.orderId} className="flex justify-between gap-4">
                    <span>
                      Order #{o.orderReference}
                      {o.customerName ? ` · ${o.customerName}` : ""} ·{" "}
                      {money(o.earnings)}
                    </span>
                    <span className="text-gray-500 text-right">
                      The customer&apos;s payment has not arrived yet
                      {o.fundsAvailableAt
                        ? `. Available from ${shortDate(o.fundsAvailableAt)}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {available.length > 0 && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Your earnings ({chosen.length} order{chosen.length === 1 ? "" : "s"})</span>
                <span className="font-medium">{money(totals.earnings)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Card processing fee (you pay this instead of Swift)</span>
                <span className="font-medium text-red-600">
                  {totals.fees > 0 ? `-${money(totals.fees)}` : money(0)}
                </span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-200">
                <span>You receive</span>
                <span>{money(totals.receive)}</span>
              </div>
              <p className="text-xs text-gray-600 pt-1">
                The money reaches your bank account in 1 to 3 working days. The
                minimum early withdrawal is {money(minimumNet)}.
              </p>
              {belowMinimum && (
                <p className="text-xs text-red-600">
                  Select more orders: you receive {money(totals.receive)}, which
                  is below the {money(minimumNet)} minimum.
                </p>
              )}
            </div>
          )}

          {available.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={chosen.length === 0 || belowMinimum || submitting}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {chosen.length === 0
                ? "Select an order to withdraw early"
                : `Withdraw ${money(totals.receive)} early`}
            </button>
          )}
        </>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Withdraw early?
            </h3>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <p>
                You will receive{" "}
                <strong className="text-gray-900">{money(totals.receive)}</strong>{" "}
                in your bank account in 1 to 3 working days.
              </p>
              <p>
                You pay{" "}
                <strong className="text-gray-900">{money(totals.fees)}</strong>{" "}
                in card processing fees. Your earnings for{" "}
                {chosen.length === 1 ? "this order" : "these orders"} are{" "}
                {money(totals.earnings)}.
              </p>
              {latestFreeDate && (
                <p className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  If you wait, Swift sends you the full{" "}
                  {money(totals.earnings)} for free
                  {chosen.length === 1
                    ? ` on ${shortDate(latestFreeDate)}.`
                    : ` by ${shortDate(latestFreeDate)}.`}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-amber-300 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  `Yes, withdraw ${money(totals.receive)} now`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderRow = ({
  order,
  checked,
  onToggle,
}: {
  order: EarlyWithdrawalOrder;
  checked: boolean;
  onToggle: () => void;
}) => (
  <tr
    onClick={onToggle}
    className={`border-b border-gray-100 cursor-pointer ${
      checked ? "bg-amber-50/60" : "hover:bg-gray-50"
    }`}
  >
    <td className="px-2 py-3">
      <input
        type="checkbox"
        aria-label={`Select order ${order.orderReference}`}
        checked={checked}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 accent-blue-600"
      />
    </td>
    <td className="px-2 py-3">
      <p className="font-medium text-gray-900">#{order.orderReference}</p>
      <p className="text-xs text-gray-500">
        {order.customerName ? `${order.customerName} · ` : ""}
        {order.eventDate ? `Event ${shortDate(order.eventDate)}` : ""}
      </p>
    </td>
    <td className="px-2 py-3 text-right text-gray-900 tabular-nums">
      {money(order.earnings)}
    </td>
    <td className="px-2 py-3 text-right text-red-600 tabular-nums">
      {order.processingFee > 0 ? `-${money(order.processingFee)}` : "Free"}
    </td>
    <td className="px-2 py-3 text-right font-semibold text-gray-900 tabular-nums">
      {money(order.youReceive)}
    </td>
    <td className="px-2 py-3 text-right text-gray-500 whitespace-nowrap">
      {shortDate(order.scheduledTransferDate)}
    </td>
  </tr>
);
