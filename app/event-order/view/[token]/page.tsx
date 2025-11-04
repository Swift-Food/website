// app/catering/view/[token]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { cateringService } from '@/services/cateringServices';
import { CateringOrderDetails} from '@/types/catering.types';

import OrderDetails from '@/app/components/catering/dashboard/OrderDetails';
import OrderItems from '@/app/components/catering/dashboard/OrderItems';
import DeliveryInfo from '@/app/components/catering/dashboard/DeliveryInfo';
import SharedAccessManager from '@/app/components/catering/dashboard/SharedAccessManager';
import PickupContactManager from '@/app/components/catering/dashboard/PickupContactManager';
import DeliveryTimeManager from '@/app/components/catering/dashboard/DeliveryTimeManager';
import { Loader2 } from 'lucide-react'; 
import OrderStatusBadge from '@/app/components/catering/dashboard/OrderStatusBadge';

export default function CateringDashboardPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [order, setOrder] = useState<CateringOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [token]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cateringService.getOrderByToken(token);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your event order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'We couldn\'t find this order. Please check your link and try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Event Order</h1>
              <p className="text-pink-100">
                Reference: <span className="font-mono font-bold">#{order.id.substring(0, 4).toUpperCase()}</span>
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <OrderDetails order={order} />
            <OrderItems order={order} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DeliveryInfo order={order} />
            <DeliveryTimeManager order={order} onUpdate={loadOrder} />
            <PickupContactManager order={order} onUpdate={loadOrder} />
            <SharedAccessManager order={order} onUpdate={loadOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}