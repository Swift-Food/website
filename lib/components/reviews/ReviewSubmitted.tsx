"use client";

import Link from "next/link";
import { Check } from "lucide-react";

interface ReviewSubmittedProps {
  token: string;
  editable: boolean;
  onEdit: () => void;
}

export default function ReviewSubmitted({
  token,
  editable,
  onEdit,
}: ReviewSubmittedProps) {
  return (
    <div className="bg-white rounded-xl p-8 text-center animate-fadeIn">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Thanks for your review</h2>
      <p className="mx-auto mt-3 max-w-md text-gray-500">
        Your feedback goes straight to the restaurants and helps other customers
        order with confidence.
      </p>

      <div className="mt-7 flex flex-col items-center gap-3">
        {editable && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-semibold text-dark-pink hover:underline"
          >
            Edit my review
          </button>
        )}
        <Link
          href={`/event-order/view/${token}`}
          className="inline-flex items-center gap-2 rounded-lg bg-dark-pink px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Back to my order
        </Link>
      </div>
    </div>
  );
}
