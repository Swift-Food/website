"use client";

import { X } from "lucide-react";
import { AvailableDiscount } from "@/types/api/customer-account.api.types";
import {
  discountHeadline,
  discountTargetLabel,
  formatCurrency,
  formatDate,
} from "./orderDisplay";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: AvailableDiscount | null;
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4 py-2 border-b border-gray-100 last:border-b-0">
    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </span>
    <span className="text-sm text-black text-right">{value}</span>
  </div>
);

export const DiscountModal = ({ isOpen, onClose, discount }: DiscountModalProps) => {
  if (!isOpen || !discount) return null;

  const {
    code,
    name,
    discountTarget,
    restaurants,
    minOrderValue,
    expiresAt,
    validFrom,
    singleUse,
  } = discount;

  // Empty means the code is valid at ALL restaurants, not none. Absent is a
  // third case: a backend older than this field sends nothing, and we must not
  // turn that into a claim either way, so the section is dropped entirely.
  const scopeKnown = Array.isArray(restaurants);
  const validEverywhere = scopeKnown && restaurants.length === 0;

  const validFromDate = validFrom ? new Date(validFrom) : null;
  const validFromIsFuture = validFromDate ? validFromDate.getTime() > Date.now() : false;

  // bg-black/50, not `bg-black bg-opacity-50`: the bg-opacity-* utilities were
  // removed in Tailwind v4, so the older form silently renders a fully opaque
  // backdrop. Several other modals in this repo still carry it.
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name ?? code}</h2>
            <p className="font-mono font-bold text-black tracking-widest text-sm mt-1">
              {code}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-lg font-medium text-black">{discountHeadline(discount)}</p>

          {scopeKnown && (
            <div>
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Valid at
              </h3>
              {validEverywhere ? (
                <p className="text-sm text-black">All restaurants</p>
              ) : (
                <ul className="text-sm text-black space-y-1">
                  {restaurants.map((restaurant) => (
                    <li key={restaurant.id}>{restaurant.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            {minOrderValue != null && (
              <DetailRow
                label="Minimum order"
                value={formatCurrency(minOrderValue)}
              />
            )}
            <DetailRow
              label="Applies to"
              value={discountTargetLabel(discountTarget)}
            />
            {expiresAt && <DetailRow label="Expires" value={formatDate(expiresAt)} />}
            {validFrom && validFromIsFuture && (
              <DetailRow label="Valid from" value={formatDate(validFrom)} />
            )}
            {singleUse && <DetailRow label="Single use" value="Yes" />}
          </div>
        </div>
      </div>
    </div>
  );
};
