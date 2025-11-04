// app/components/catering/dashboard/OrderDetails.tsx
import React from 'react';
import { CateringOrderDetails } from '@/types/catering.types';
import { Calendar, Clock, Users, MapPin, FileText } from 'lucide-react';

interface OrderDetailsProps {
  order: CateringOrderDetails;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Event Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(order.eventDate).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Event Time</p>
            <p className="font-semibold text-gray-900">{order.eventTime}</p>
            
          </div>
        </div>



        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Event Type</p>
            <p className="font-semibold text-gray-900">{order.eventType || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 md:col-span-2">
          <MapPin className="h-5 w-5 text-pink-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Delivery Address</p>
            <p className="font-semibold text-gray-900">{order.deliveryAddress}</p>
          </div>
        </div>

        {order.specialRequirements && (
          <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-2">📋 Special Requirements</p>
            <p className="text-sm text-yellow-800 whitespace-pre-wrap">{order.specialRequirements}</p>
          </div>
        )}

        {order.publicNote && (
          <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">💬 Note from Swift Food</p>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{order.publicNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}