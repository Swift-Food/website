/**
 * ReceiptViewButton Component
 * Button to view receipt with loading state
 */

import { Loader, EyeIcon } from "lucide-react";

interface ReceiptViewButtonProps {
  onViewReceipt: () => void;
  isViewingReceipt: boolean;
}

export function ReceiptViewButton({
  onViewReceipt,
  isViewingReceipt,
}: ReceiptViewButtonProps) {
  return (
    <div className="flex justify-end gap-2 mb-3">
      <button
        onClick={onViewReceipt}
        disabled={isViewingReceipt}
        className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        type="button"
      >
        {isViewingReceipt ? (
          <>
            <Loader size={14} className="animate-spin" />
            Viewing...
          </>
        ) : (
          <>
            <EyeIcon size={14} />
            View Receipt
          </>
        )}
      </button>
    </div>
  );
}
