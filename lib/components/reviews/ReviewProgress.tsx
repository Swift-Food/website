"use client";

interface ReviewProgressProps {
  steps: string[];
  current: number;
  furthestReached: number;
  onStepClick: (index: number) => void;
}

export default function ReviewProgress({
  steps,
  current,
  furthestReached,
  onStepClick,
}: ReviewProgressProps) {
  return (
    <nav aria-label="Review progress" className="mb-6">
      <ol className="flex items-center gap-1.5">
        {steps.map((label, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          const isReachable = index <= furthestReached;

          return (
            <li key={index} className="flex-1">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full text-left disabled:cursor-not-allowed ${
                  isReachable ? "cursor-pointer" : ""
                }`}
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors ${
                    isCurrent
                      ? "bg-dark-pink"
                      : isDone
                        ? "bg-pink-300"
                        : "bg-gray-200"
                  }`}
                />
                <span
                  className={`mt-2 block text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                    isCurrent ? "text-dark-pink" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
