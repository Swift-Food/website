'use client';


import { XCircle } from 'lucide-react';
import { Suspense } from 'react';

function FailureContent() {



  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-4">Unfortunately, your payment could not be processed.</p>
       
       
      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailureContent />
    </Suspense>
  );
}