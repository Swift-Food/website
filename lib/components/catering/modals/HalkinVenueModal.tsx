"use client";

import { useState } from "react";
import { MapPin, ExternalLink, Copy, Check } from "lucide-react";

const HALKIN_URL = "https://events.halkin.com/coworking/halkin";

interface HalkinVenueModalProps {
  onClose: () => void;
}

export default function HalkinVenueModal({ onClose }: HalkinVenueModalProps) {
  const [copied, setCopied] = useState(false);

  const handleBookSpace = () => {
    window.open(HALKIN_URL, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(HALKIN_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delivering to Halkin?</h3>
            <p className="text-sm text-gray-500">We noticed you're ordering to a Halkin venue</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-pink-500 mt-0.5">✓</span>
            <span>Book a dedicated event space at Halkin</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-pink-500 mt-0.5">✓</span>
            <span>Order catering in the same seamless flow</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-pink-500 mt-0.5">✓</span>
            <span>Everything handled in one place</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-1.5">Save this link for next time</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-600 flex-1 truncate">{HALKIN_URL}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleBookSpace}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Book a space for my event
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border border-base-300 text-gray-600 rounded-xl hover:bg-base-100 transition-colors font-medium"
          >
            Continue ordering
          </button>
        </div>
      </div>
    </div>
  );
}
