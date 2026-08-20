"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { reviewService } from "@/services/api/review.api";
import type { ReviewableOrder } from "@/types/review.types";

interface ReviewPromptCardProps {
  token: string;
  orderStatus: string;
}

export default function ReviewPromptCard({
  token,
  orderStatus,
}: ReviewPromptCardProps) {
  const router = useRouter();
  const [review, setReview] = useState<ReviewableOrder | null>(null);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (orderStatus !== "completed") return;

    reviewService
      .getReviewableOrder(token)
      .then(setReview)
      .catch(() => setReview(null));
  }, [token, orderStatus]);

  if (orderStatus !== "completed" || !review) return null;

  const goToReview = (seedScore?: number) => {
    if (seedScore) {
      // Carry the tapped score into the flow so a one-tap rating is not lost.
      sessionStorage.setItem(
        `review-draft:${token}`,
        JSON.stringify({
          step: 0,
          orderScore: seedScore,
          orderComment: "",
          restaurantScores: {},
          restaurantComments: {},
          itemScores: {},
        })
      );
    }
    router.push(`/event-order/view/${token}/review`);
  };

  if (review.alreadySubmitted) {
    return (
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900">Your review</h3>
        <div className="mt-3 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-5 w-5 ${
                n <= (review.existing?.orderScore ?? 0)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300"
              }`}
            />
          ))}
          <span className="ml-1 text-sm text-gray-500">
            {review.existing?.orderScore} / 5 overall
          </span>
        </div>
        {review.canEdit ? (
          <button
            type="button"
            onClick={() => goToReview()}
            className="mt-4 text-sm font-semibold text-dark-pink hover:underline"
          >
            Edit my review
          </button>
        ) : (
          <p className="mt-4 text-sm text-gray-400">
            The 7 day window for changing this review has closed.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900">How was your order?</h3>
      <p className="mt-1 text-sm text-gray-500">
        Your feedback helps the restaurants and other customers.
      </p>

      <div className="mt-4 flex items-center" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => goToReview(n)}
            className="p-1.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                n <= hover
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goToReview()}
        className="mt-4 w-full rounded-lg bg-dark-pink px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        Leave a review
      </button>
    </div>
  );
}
