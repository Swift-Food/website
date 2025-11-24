// app/components/catering/dashboard/OrderDetails.tsx
import React from 'react';
import { CateringOrderResponse } from '@/types/api';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { formatDeliveryAddress } from '@/app/restaurant/dashboard/catering/utils/address.utils';

interface OrderDetailsProps {
  order: CateringOrderResponse;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Event Details</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600">Event Date</p>
            <p className="font-semibold text-sm sm:text-base text-gray-900">
              {new Date(order.eventDate).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600">Event Time</p>
            <p className="font-semibold text-sm sm:text-base text-gray-900">{order.eventTime}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600">Event Type</p>
            <p className="font-semibold text-sm sm:text-base text-gray-900">{order.eventType || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:gap-3 sm:col-span-2">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600">Delivery Address</p>
            <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{formatDeliveryAddress(order.deliveryAddress)}</p>
          </div>
        </div>

        {order.specialInstructions && (
          <div className="sm:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-semibold text-yellow-900 mb-2">📋 Special Requirements</p>
            <p className="text-xs sm:text-sm text-yellow-800 whitespace-pre-wrap break-words">{order.specialInstructions}</p>
          </div>
        )}

        {order.publicNote && (
          <div className="sm:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">💬 Note from Swift Food</p>
            <p className="text-xs sm:text-sm text-blue-800 whitespace-pre-wrap break-words">{order.publicNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}