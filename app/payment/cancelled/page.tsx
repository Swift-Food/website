'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function CancelledContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-yellow-700 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-4">You cancelled the payment process.</p>
   
       
      </div>
    </div>
  );
}

export default function CancelledPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CancelledContent />
    </Suspense>
  );
}