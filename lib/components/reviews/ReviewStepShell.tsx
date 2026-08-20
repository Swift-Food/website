"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface ReviewStepShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onSkip?: () => void;
}

export default function ReviewStepShell({
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  onSkip,
}: ReviewStepShellProps) {
  return (
    <div className="bg-white rounded-xl p-5 sm:p-8 animate-fadeIn">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}

      <div className="mt-6">{children}</div>

      <div className="mt-8 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="inline-flex items-center gap-2 rounded-lg bg-dark-pink px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
