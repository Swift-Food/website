"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Loader, Calendar, AlertCircle } from "lucide-react";
import {
  fetchAvailableInvoices,
  openInvoiceInNewWindow,
  formatCurrency,
  InvoiceListItem,
} from "./invoiceUtils";

interface TaxInvoicesListProps {
  restaurantId: string;
  selectedAccountId?: string | null;
  token?: string;
}

export const TaxInvoicesList = ({
  restaurantId,
  selectedAccountId,
  token,
}: TaxInvoicesListProps) => {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [restaurantId, selectedAccountId]);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAvailableInvoices(
        restaurantId,
        selectedAccountId || undefined,
        token
      );
      setInvoices(data);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: InvoiceListItem) => {
    const key = `${invoice.year}-${invoice.month}`;
    setViewingInvoice(key);

    openInvoiceInNewWindow(
      restaurantId,
      invoice.year,
      invoice.month,
      selectedAccountId || undefined,
      token
    );

    // Reset viewing state after a short delay
    setTimeout(() => setViewingInvoice(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading invoices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadInvoices}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Invoices Available
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Tax invoices will appear here once you have completed catering orders.
          Invoices are generated monthly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        Monthly commission invoices for completed catering orders. Click to view and download.
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => {
              const key = `${invoice.year}-${invoice.month}`;
              const isViewing = viewingInvoice === key;

              return (
                <tr key={key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {invoice.monthName} {invoice.year}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {invoice.orderCount} {invoice.orderCount === 1 ? "order" : "orders"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(invoice.totalCommission)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      disabled={isViewing}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isViewing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          View Invoice
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        <p>
          Invoices contain all completed orders delivered within the invoice period.
          Commission and tax are calculated per order.
        </p>
      </div>
    </div>
  );
};
