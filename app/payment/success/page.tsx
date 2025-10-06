'use client';

import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {


  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-700 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
        {/* {orderId && (
          <p className="text-sm text-gray-500">Order ID: {orderId}</p>
        )} */}
        {/* <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Return to Home
        </button> */}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}