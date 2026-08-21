"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { reviewService } from "@/services/api/review.api";
import type { ReviewableOrder, ReviewDraft } from "@/types/review.types";
import StarRating from "@/lib/components/reviews/StarRating";
import ReviewProgress from "@/lib/components/reviews/ReviewProgress";
import ReviewStepShell from "@/lib/components/reviews/ReviewStepShell";
import ReviewSubmitted from "@/lib/components/reviews/ReviewSubmitted";

const emptyDraft: ReviewDraft = {
  step: 0,
  orderScore: null,
  orderComment: "",
  restaurantScores: {},
  restaurantComments: {},
  itemScores: {},
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRecordOf<T>(
  value: unknown,
  isValue: (v: unknown) => v is T
): value is Record<string, T> {
  return isPlainObject(value) && Object.values(value).every(isValue);
}

/**
 * Validates the shape of a draft restored from sessionStorage. A stale or
 * hand-edited draft that fails this check is discarded rather than trusted,
 * since an out-of-range `step` (or a malformed field) would otherwise leave
 * the page rendering no step body under the progress bar.
 */
function isValidDraftShape(value: unknown): value is ReviewDraft {
  if (!isPlainObject(value)) return false;
  const {
    step,
    orderScore,
    orderComment,
    restaurantScores,
    restaurantComments,
    itemScores,
  } = value;

  if (typeof step !== "number" || !Number.isFinite(step)) return false;
  if (orderScore !== null && typeof orderScore !== "number") return false;
  if (typeof orderComment !== "string") return false;
  if (!isRecordOf(restaurantScores, (v): v is number => typeof v === "number"))
    return false;
  if (
    !isRecordOf(restaurantComments, (v): v is string => typeof v === "string")
  )
    return false;
  if (!isRecordOf(itemScores, (v): v is number => typeof v === "number"))
    return false;

  return true;
}

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;
  const draftKey = `review-draft:${token}`;

  const [order, setOrder] = useState<ReviewableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewDraft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reviewService.getReviewableOrder(token);
        setOrder(data);

        // Mirrors the stepLabels computation below: order + one per
        // restaurant + dishes + submit.
        const maxStepIndex = data.restaurants.length + 2;

        const stored = sessionStorage.getItem(draftKey);
        let restoredDraft = false;
        if (stored) {
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(stored);
          } catch {
            parsed = null;
          }

          if (isValidDraftShape(parsed)) {
            const clampedStep = Math.min(
              Math.max(parsed.step, 0),
              maxStepIndex
            );
            const safeDraft: ReviewDraft = { ...parsed, step: clampedStep };
            setDraft(safeDraft);
            setStep(clampedStep);
            setFurthest(clampedStep);
            restoredDraft = true;
          } else {
            // Corrupted or stale draft (e.g. an out-of-range step from a
            // previous version of the order) - discard rather than render
            // a blank page under the progress bar.
            sessionStorage.removeItem(draftKey);
          }
        }

        if (!restoredDraft && data.existing) {
          // Seed the form from the submitted review so editing starts populated.
          setDraft({
            step: 0,
            orderScore: data.existing.orderScore,
            orderComment: data.existing.orderComment ?? "",
            restaurantScores: Object.fromEntries(
              data.existing.restaurants.map((r) => [r.restaurantId, r.score])
            ),
            restaurantComments: Object.fromEntries(
              data.existing.restaurants.map((r) => [
                r.restaurantId,
                r.comment ?? "",
              ])
            ),
            itemScores: Object.fromEntries(
              data.existing.items.map((i) => [i.menuItemId, i.score])
            ),
          });
          setSubmitted(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load review details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, draftKey]);

  const persist = useCallback(
    (next: ReviewDraft, nextStep: number) => {
      const payload = { ...next, step: nextStep };
      setDraft(payload);
      sessionStorage.setItem(draftKey, JSON.stringify(payload));
    },
    [draftKey]
  );

  const goTo = (nextStep: number) => {
    setStep(nextStep);
    setFurthest((f) => Math.max(f, nextStep));
    persist(draft, nextStep);
  };

  const restaurants = order?.restaurants ?? [];

  const stepLabels = useMemo(
    () => [
      "Your order",
      ...restaurants.map((r) => r.restaurantName),
      "Dishes",
      "Submit",
    ],
    [restaurants]
  );

  const totalSteps = stepLabels.length;
  const itemsStepIndex = totalSteps - 2;
  const summaryStepIndex = totalSteps - 1;

  // Menu item ids actually present on the loaded order, used to keep the
  // submit payload's items in sync with its restaurants: both are filtered
  // against live order data so a stale draft entry can never reach the API.
  const validMenuItemIds = useMemo(
    () => new Set(restaurants.flatMap((r) => r.items.map((i) => i.menuItemId))),
    [restaurants]
  );

  const handleSubmit = async () => {
    if (!order || draft.orderScore === null) return;

    try {
      setSubmitting(true);
      setError(null);

      await reviewService.submitReview(token, {
        orderScore: draft.orderScore,
        orderComment: draft.orderComment || undefined,
        restaurants: restaurants
          .filter((r) => draft.restaurantScores[r.restaurantId])
          .map((r) => ({
            restaurantId: r.restaurantId,
            mealSessionId: r.mealSessionId ?? undefined,
            score: draft.restaurantScores[r.restaurantId],
            comment: draft.restaurantComments[r.restaurantId] || undefined,
          })),
        items: Object.entries(draft.itemScores)
          .filter(([menuItemId]) => validMenuItemIds.has(menuItemId))
          .map(([menuItemId, score]) => ({
            menuItemId,
            score,
          })),
      });

      sessionStorage.removeItem(draftKey);
      setSubmitted(true);
    } catch (err: any) {
      // Keep the draft intact so a filled-in review is never lost.
      setError(err.message || "Failed to submit review. Your answers are saved.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dark-pink" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900">
            We could not open this review
          </h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Link
            href={`/event-order/view/${token}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-dark-pink hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to my order
          </Link>
        </div>
      </div>
    );
  }

  if (order && !order.canEdit && order.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-2xl">
          <ReviewSubmitted token={token} editable={false} onEdit={() => {}} />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-2xl">
          <ReviewSubmitted
            token={token}
            editable={order?.canEdit ?? false}
            onEdit={() => {
              setSubmitted(false);
              goTo(0);
            }}
          />
        </div>
      </div>
    );
  }

  const restaurantForStep = restaurants[step - 1];

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-4">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/event-order/view/${token}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my order
        </Link>

        <ReviewProgress
          steps={stepLabels}
          current={step}
          furthestReached={furthest}
          onStepClick={goTo}
        />

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 0 && (
          <ReviewStepShell
            title="How was your order overall?"
            subtitle="Delivery, timing and the service from Swift."
            onNext={() => goTo(1)}
            nextDisabled={draft.orderScore === null}
          >
            <StarRating
              value={draft.orderScore}
              onChange={(score) =>
                persist({ ...draft, orderScore: score }, step)
              }
              showLabel
              ariaLabelPrefix="Rate the order"
            />
            <textarea
              value={draft.orderComment}
              onChange={(e) =>
                persist({ ...draft, orderComment: e.target.value }, step)
              }
              placeholder="Anything you would like us to know? (optional)"
              rows={3}
              className="mt-5 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-dark-pink focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
            />
          </ReviewStepShell>
        )}

        {restaurantForStep && (
          <ReviewStepShell
            title={`How was ${restaurantForStep.restaurantName}?`}
            subtitle="Rate the food from this restaurant."
            onBack={() => goTo(step - 1)}
            onNext={() => goTo(step + 1)}
            nextDisabled={
              !draft.restaurantScores[restaurantForStep.restaurantId]
            }
          >
            <StarRating
              value={
                draft.restaurantScores[restaurantForStep.restaurantId] ?? null
              }
              onChange={(score) =>
                persist(
                  {
                    ...draft,
                    restaurantScores: {
                      ...draft.restaurantScores,
                      [restaurantForStep.restaurantId]: score,
                    },
                  },
                  step
                )
              }
              showLabel
              ariaLabelPrefix={`Rate ${restaurantForStep.restaurantName}`}
            />
            <textarea
              value={
                draft.restaurantComments[restaurantForStep.restaurantId] ?? ""
              }
              onChange={(e) =>
                persist(
                  {
                    ...draft,
                    restaurantComments: {
                      ...draft.restaurantComments,
                      [restaurantForStep.restaurantId]: e.target.value,
                    },
                  },
                  step
                )
              }
              placeholder="Tell them what you thought (optional)"
              rows={3}
              className="mt-5 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-dark-pink focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
            />
          </ReviewStepShell>
        )}

        {step === itemsStepIndex && (
          <ReviewStepShell
            title="Rate the dishes"
            subtitle="Optional - rate only the ones you tried."
            onBack={() => goTo(step - 1)}
            onNext={() => goTo(summaryStepIndex)}
            onSkip={() => goTo(summaryStepIndex)}
          >
            <div className="space-y-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.restaurantId}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    {restaurant.restaurantName}
                  </h3>
                  <ul className="divide-y divide-gray-100">
                    {restaurant.items.map((item) => (
                      <li
                        key={item.menuItemId}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <span className="text-sm text-gray-800">
                          {item.menuItemName}
                        </span>
                        <StarRating
                          size="sm"
                          value={draft.itemScores[item.menuItemId] ?? null}
                          onChange={(score) =>
                            persist(
                              {
                                ...draft,
                                itemScores: {
                                  ...draft.itemScores,
                                  [item.menuItemId]: score,
                                },
                              },
                              step
                            )
                          }
                          ariaLabelPrefix={`Rate ${item.menuItemName}`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ReviewStepShell>
        )}

        {step === summaryStepIndex && (
          <ReviewStepShell
            title="Ready to submit?"
            subtitle="You can change this for 7 days."
            onBack={() => goTo(step - 1)}
            onNext={handleSubmit}
            nextLabel={submitting ? "Submitting..." : "Submit review"}
            nextDisabled={submitting || draft.orderScore === null}
          >
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Overall</dt>
                <dd className="font-semibold text-gray-900">
                  {draft.orderScore} / 5
                </dd>
              </div>
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.restaurantId}
                  className="flex items-center justify-between"
                >
                  <dt className="text-gray-500">{restaurant.restaurantName}</dt>
                  <dd className="font-semibold text-gray-900">
                    {draft.restaurantScores[restaurant.restaurantId]
                      ? `${draft.restaurantScores[restaurant.restaurantId]} / 5`
                      : "Not rated"}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Dishes rated</dt>
                <dd className="font-semibold text-gray-900">
                  {Object.keys(draft.itemScores).length}
                </dd>
              </div>
            </dl>
          </ReviewStepShell>
        )}
      </div>
    </div>
  );
}
