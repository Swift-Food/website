// app/components/catering/dashboard/DeliveryInfo.tsx (Complete version)
import React from 'react';
import { CateringOrderDetails } from '@/types/catering.types';
import { User, Mail, Phone, Clock, Building } from 'lucide-react';

interface DeliveryInfoProps {
  order: CateringOrderDetails;
}

export default function DeliveryInfo({ order }: DeliveryInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-medium text-gray-900">{order.customerName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900 break-all">{order.customerEmail}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium text-gray-900">{order.customerPhone}</p>
          </div>
        </div>

        {order.organization && (
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Organization</p>
              <p className="font-medium text-gray-900">{order.organization}</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Order Placed</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}