import { fetchWithAuth, API_BASE_URL } from "@/lib/api-client/auth-client";

export interface InvoiceListItem {
  year: number;
  month: number;
  monthName: string;
  orderCount: number;
  totalCommission: number;
  hasData: boolean;
}

export interface CommissionInvoiceData {
  invoiceSerial: string;
  issueDate: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;

  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantVatNo?: string;

  rows: Array<{
    orderType: string;
    quantity: number;
    totalOrderValue: number;
    netCommission: number;
    commissionVatRate: string;
    commissionVat: string;
    grossCommission: number;
  }>;

  totalQuantity: number;
  totalOrderValue: number;
  totalNetCommission: number;
  totalCommissionVat: string;
  totalGrossCommission: number;

  invoiceNet: number;
  invoiceVat: string;
  invoiceTotal: number;

  commissionRate: number;
  orderCount: number;
}

/**
 * Fetches list of available invoices for a restaurant
 */
export async function fetchAvailableInvoices(
  restaurantId: string,
  accountId?: string
): Promise<InvoiceListItem[]> {
  const params = new URLSearchParams();
  if (accountId) params.set("accountId", accountId);

  const url = `${API_BASE_URL}/catering-orders/restaurant/${restaurantId}/commission-invoices?${params}`;

  const res = await fetchWithAuth(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch invoices: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.invoices || [];
}

/**
 * Opens invoice HTML in a new window
 */
export function openInvoiceInNewWindow(
  restaurantId: string,
  year: number,
  month: number,
  accountId?: string
): void {
  const params = new URLSearchParams();
  if (accountId) params.set("accountId", accountId);

  const url = `${API_BASE_URL}/catering-orders/restaurant/${restaurantId}/commission-invoice/${year}/${month}/html?${params}`;

  fetchWithAuth(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch invoice: ${res.status}`);
      }
      return res.text();
    })
    .then((html) => {
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, "_blank");

      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

      if (!win) {
        alert("Please allow popups to view the invoice.");
      }
    })
    .catch((err) => {
      console.error("Error opening invoice:", err);
      alert("Failed to load invoice. Please try again.");
    });
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}
