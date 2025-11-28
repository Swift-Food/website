/**
 * Custom hook for receipt viewing functionality
 * Encapsulates receipt viewing state and logic
 */

import { useState } from "react";
import { fetchReceiptJson, buildReceiptHTML } from "../receiptUtils";

interface UseReceiptViewerParams {
  orderId: string;
  restaurantId: string;
  eventDate: string | Date;
  token?: string;
  selectedAccountId?: string;
  availableAccounts?: Record<string, any>;
}

export function useReceiptViewer({
  orderId,
  restaurantId,
  eventDate,
  token,
  selectedAccountId,
  availableAccounts,
}: UseReceiptViewerParams) {
  const [viewingReceipt, setViewingReceipt] = useState(false);

  const viewReceipt = async () => {
    if (!token) {
      alert("Missing authentication token. Please log in again.");
      return;
    }

    setViewingReceipt(true);
    try {
      const branchName =
        selectedAccountId && availableAccounts
          ? availableAccounts[selectedAccountId]?.name
          : null;

      const data = await fetchReceiptJson(orderId, restaurantId, token);
      const html = buildReceiptHTML(data, orderId, String(eventDate), branchName);

      const w = window.open("", "_blank");
      if (!w) {
        alert("Popup blocked. Please allow popups to view receipt.");
        return;
      }

      w.document.write(html);
      w.document.close();
      w.focus();
    } catch (err) {
      console.error("Receipt view error:", err);
      alert(
        `Failed to view receipt: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setViewingReceipt(false);
    }
  };

  return {
    viewReceipt,
    viewingReceipt,
  };
}
