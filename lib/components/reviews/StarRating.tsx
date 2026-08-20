"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export const RATING_LABELS = ["Terrible", "Poor", "Okay", "Good", "Great"];

interface StarRatingProps {
  value: number | null;
  onChange: (score: number) => void;
  size?: "sm" | "lg";
  showLabel?: boolean;
  ariaLabelPrefix?: string;
}

export default function StarRating({
  value,
  onChange,
  size = "lg",
  showLabel = false,
  ariaLabelPrefix = "Rate",
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value || 0;

  // 44px minimum touch target on the large variant - this page is opened
  // predominantly on a phone from an emailed link.
  const starClass = size === "lg" ? "h-9 w-9" : "h-5 w-5";
  const buttonClass = size === "lg" ? "p-1.5" : "p-0.5";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${ariaLabelPrefix} ${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={value === n}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className={`${buttonClass} transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-pink/40 rounded`}
          >
            <Star
              className={`${starClass} transition-colors ${
                n <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {showLabel && active > 0 && (
        <span className="text-sm font-medium text-gray-600">
          {RATING_LABELS[active - 1]}
        </span>
      )}
    </div>
  );
}
