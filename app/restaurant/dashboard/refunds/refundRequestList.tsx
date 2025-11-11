// components/restaurant-dashboard/refunds/RefundRequestsList.tsx

'use client';

import { RefundRequest } from "@/types/refund.types";
import { Clock, CheckCircle, XCircle, Mail, Calendar } from 'lucide-react';

interface RefundRequestsListProps {
  refunds: RefundRequest[];
  onViewDetails: (refund: RefundRequest) => void;
}

export const RefundRequestsList = ({ refunds, onViewDetails }: RefundRequestsListProps) => {
  const getStatusBadge = (status: string) => {
    const config = {
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
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">
                  Order #{refund.cateringOrderId?.substring(0, 8).toUpperCase() || refund.corporateOrderId?.substring(0, 8).toUpperCase()}
                </h3>
                {getStatusBadge(refund.status)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {refund.userEmail || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(refund.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                £{refund.requestedAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Requested Amount</p>
            </div>
          </div>

          {/* Refund Items */}
          {refund.refundItems && refund.refundItems.length > 0 && (
            <div className="mb-4 bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
              <div className="space-y-2">
                {refund.refundItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-900">
                      {item.itemName} <span className="text-gray-500">x{item.quantity}</span>
                    </span>
                    <span className="font-medium text-gray-900">£{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
            <p className="text-sm text-gray-900 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              {formatReason(refund.reason)}
            </p>
          </div>

          {/* Additional Details */}
          {refund.additionalDetails && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Additional Details:</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
                {refund.additionalDetails}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={() => onViewDetails(refund)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              View Details & Respond
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};