// components/restaurant-dashboard/refunds/RefundRequestsList.tsx

'use client';

import { RefundRequest } from "@/types/refund.types";
import { Clock, CheckCircle, XCircle, Mail, Calendar } from 'lucide-react';
import { useState } from "react";

interface RefundRequestsListProps {
  refunds: RefundRequest[];
  onProcessRefund: (refundId: string, data: {
    status: 'approved' | 'rejected';
    approvedAmount?: number;
    restaurantResponse?: string;
  }) => Promise<void>;
}

export const RefundRequestsList = ({ refunds, onProcessRefund }: RefundRequestsListProps) => {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApproveRefund = async (refund: RefundRequest) => {
    if (!window.confirm(`Confirm refund of £${Number(refund.requestedAmount).toFixed(2)} to ${refund.userEmail}?`)) {
      return;
    }

    setProcessing(refund.id);
    try {
      await onProcessRefund(refund.id, {
        status: 'approved',
        approvedAmount: refund.requestedAmount,
      });
    } catch (error) {
      alert('Failed to process refund. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRefund = async (refund: RefundRequest) => {
    const reason = window.prompt('Reason for rejection (required):');
    if (!reason) return;

    setProcessing(refund.id);
    try {
      await onProcessRefund(refund.id, {
        status: 'rejected',
        restaurantResponse: reason,
      });
    } catch (error) {
      alert('Failed to reject refund. Please try again.');
    } finally {
      setProcessing(null);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'Pending Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' },
      processed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Processed' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Cancelled' },
    };
  
    const { bg, text, icon: Icon, label } = config[status] || config.pending;
  
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatReason = (reason: string) => {
    return reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (refunds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No refund requests</p>
        <p className="text-sm text-gray-500 mt-1">All refund requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {refunds.map((refund) => (
        <div
          key={refund.id}
          className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          {/* Header - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  Order #{refund.cateringOrderId?.substring(0, 4).toUpperCase() || refund.corporateOrderId?.substring(0, 4).toUpperCase()}
                </h3>
                {getStatusBadge(refund.status)}
              </div>
              
              {/* User info - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{refund.userEmail || 'N/A'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {formatDate(refund.createdAt)}
                </span>
              </div>
            </div>
            
            {/* Amount - Move to top on mobile */}
            <div className="text-left sm:text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                £{Number(refund.requestedAmount).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Requested Amount</p>
            </div>
          </div>

          {/* Refund Items - Smaller padding on mobile */}
          {refund.refundItems && refund.refundItems.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Items:</p>
              <div className="space-y-1.5 sm:space-y-2">
                {refund.refundItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 text-xs sm:text-sm">
                    <span className="text-gray-900 flex-1 min-w-0">
                      <span className="line-clamp-1">{item.itemName}</span>{' '}
                      <span className="text-gray-500">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      £{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mb-4">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Reason:</p>
            <p className="text-xs sm:text-sm text-gray-900 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              {formatReason(refund.reason)}
            </p>
          </div>

          {/* Additional Details */}
          {refund.additionalDetails && (
            <div className="mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Additional Details:</p>
              <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 rounded px-3 py-2 break-words">
                {refund.additionalDetails}
              </p>
            </div>
          )}

          {/* Action Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <a
              href={`mailto:${refund.userEmail}?subject=Refund Request for Order #${refund.cateringOrderId?.substring(0, 4).toUpperCase() || refund.corporateOrderId?.substring(0, 4).toUpperCase()}&body=Dear ${refund.userName || 'Customer'},%0D%0A%0D%0ARegarding your refund request...`}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
            
            {refund.status === 'pending' && (
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => handleRejectRefund(refund)}
                  disabled={processing === refund.id}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {processing === refund.id ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApproveRefund(refund)}
                  disabled={processing === refund.id}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 whitespace-nowrap"
                >
                  {processing === refund.id ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};