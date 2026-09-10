"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import type { OnboardingStep } from "@/lib/utils/restaurant-onboarding";
import { onboardingProgress } from "@/lib/utils/restaurant-onboarding";

/**
 * The setup checklist on the dashboard home.
 *
 * It disappears on its own once the required steps are done — a partner who
 * has been trading for a year should not be shown a to-do list every morning.
 * The optional discount step is shown while the card is open but never keeps
 * it open.
 *
 * The Stripe step has no link of its own: the onboarding button already lives
 * further down this page, with the retry handling that goes with it, so the
 * row points there instead of starting a second copy of that flow.
 */

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  /** Element id of the Stripe onboarding block further down the page. */
  stripeAnchorId: string;
  /** Settings opens via a data fetch, not a plain link. */
  onOpenSettings: () => void;
}

export const OnboardingChecklist = ({
  steps,
  stripeAnchorId,
  onOpenSettings,
}: OnboardingChecklistProps) => {
  const progress = onboardingProgress(steps);
  if (progress.allRequiredDone) return null;

  const percent = Math.round((progress.completed / progress.total) * 100);

  return (
    <section
      aria-labelledby="onboarding-heading"
      className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="onboarding-heading" className="text-lg font-bold text-gray-900">
            Finish setting up
          </h2>
          <span className="text-sm font-medium text-gray-500">
            {progress.completed} of {progress.total} done
          </span>
        </div>
        {/* True for a partner on their first day and for one who has been
            trading for a year with no logo — both see this card. */}
        <p className="text-sm text-gray-600 mt-1">
          Anything left here changes how customers see you, or how orders reach
          you.
        </p>
        <div
          className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={progress.completed}
          aria-valuemin={0}
          aria-valuemax={progress.total}
        >
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {steps.map((step) => (
          <li key={step.id} className="px-5 py-4">
            <div className="flex items-start gap-3">
              {step.done ? (
                <CheckCircle2
                  size={20}
                  className="text-success shrink-0 mt-0.5"
                  aria-hidden
                />
              ) : (
                <Circle size={20} className="text-gray-300 shrink-0 mt-0.5" aria-hidden />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`font-semibold ${
                      step.done ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.optional && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                      Optional
                    </span>
                  )}
                  <span className="sr-only">
                    {step.done ? "completed" : "not completed"}
                  </span>
                </div>

                {!step.done && (
                  <>
                    <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
                    {step.detail && (
                      <p className="text-sm text-gray-900 font-medium mt-1">
                        {step.detail}
                      </p>
                    )}

                    {step.tasks.some((task) => !task.done) && (
                      <ul className="mt-3 space-y-2">
                        {step.tasks
                          .filter((task) => !task.done)
                          .map((task) => (
                            <li key={task.id}>
                              <Link
                                href={task.href}
                                className="group flex items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:border-primary hover:bg-primary/5 transition-colors"
                              >
                                <span
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                                  aria-hidden
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-medium text-gray-900">
                                    {task.label}
                                  </span>
                                  <span className="block text-xs text-gray-600">
                                    {task.consequence}
                                  </span>
                                </span>
                                <ArrowRight
                                  size={16}
                                  className="mt-0.5 shrink-0 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                                  aria-hidden
                                />
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}

                    <div className="mt-3">
                      <StepAction
                        step={step}
                        stripeAnchorId={stripeAnchorId}
                        onOpenSettings={onOpenSettings}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const actionClass =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors";

const StepAction = ({
  step,
  stripeAnchorId,
  onOpenSettings,
}: {
  step: OnboardingStep;
  stripeAnchorId: string;
  onOpenSettings: () => void;
}) => {
  if (step.id === "stripe") {
    return (
      <a href={`#${stripeAnchorId}`} className={actionClass}>
        {step.actionLabel}
        <ArrowRight size={16} aria-hidden />
      </a>
    );
  }

  if (step.id === "settings") {
    return (
      <button type="button" onClick={onOpenSettings} className={actionClass}>
        {step.actionLabel}
        <ArrowRight size={16} aria-hidden />
      </button>
    );
  }

  if (!step.href) return null;

  return (
    <Link href={step.href} className={actionClass}>
      {step.actionLabel}
      <ArrowRight size={16} aria-hidden />
    </Link>
  );
};
