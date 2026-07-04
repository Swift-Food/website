"use client";

import { Info } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Blue info callout — used to preview customer-visible text like
 * "Customers will see: '24 hours notice'". Reduces the guesswork about
 * whether a setting actually reaches the customer.
 */
export const PreviewCallout = ({ children }: Props) => (
  <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
    <Info size={16} className="text-blue-600 flex-shrink-0" />
    <span className="text-sm text-blue-800">{children}</span>
  </div>
);
