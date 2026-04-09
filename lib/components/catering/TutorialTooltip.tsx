"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export interface TutorialStep {
  id: string;
  targetRef: React.RefObject<HTMLElement | null>;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  requiresClick?: boolean; // User must click the target to proceed
  manualAdvance?: boolean; // Like requiresClick (shows hint + hole) but does NOT auto-advance on click
  showNext?: boolean; // Show "Next" button
  nextLabel?: string; // Custom label for the primary action
  showSkip?: boolean; // Show "Skip Tutorial" button
  highlightPadding?: number; // Padding around highlight
  highlightExtendBottom?: number; // Extra height to extend highlight downward
  highlightExtendBottomToViewport?: boolean; // Extend highlight to bottom of viewport
  highlightMinTop?: number; // Clamp the highlight so it doesn't extend into sticky UI
  autoScroll?: boolean; // Scroll element into view inside updatePosition before positioning
  onBeforeShow?: (onComplete: () => void) => void; // Called before showing this step; call onComplete when ready to position
}

interface HighlightRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface TutorialTooltipProps {
  step: TutorialStep | null;
  onNext: () => void;
  onSkip: () => void;
  currentStepIndex: number;
  totalSteps: number;
}

export default function TutorialTooltip({
  step,
  onNext,
  onSkip,
  currentStepIndex,
  totalSteps,
}: TutorialTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const prevStepIdRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!step?.targetRef?.current || !tooltipRef.current) return;

    const targetEl = step.targetRef.current;
    const tooltipEl = tooltipRef.current;

    // If autoScroll: scroll element to roughly the middle of the viewport, then re-measure
    if (step.autoScroll) {
      const preRect = targetEl.getBoundingClientRect();
      const targetTop = Math.round(window.innerHeight * 0.35);
      if (preRect.top < (step.highlightMinTop ?? 0) || preRect.top > window.innerHeight * 0.65) {
        window.scrollTo({ top: window.scrollY + preRect.top - targetTop, behavior: "instant" });
      }
    }

    const targetRect = targetEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const highlightTop = Math.max(targetRect.top, step.highlightMinTop ?? 0);
    const highlightBottom = Math.max(targetRect.bottom, highlightTop);
    const adjustedTargetRect: HighlightRect = {
      left: targetRect.left,
      top: highlightTop,
      right: targetRect.right,
      bottom: highlightBottom,
      width: targetRect.width,
      height: highlightBottom - highlightTop,
    };

    // Calculate highlight sizing first so both the mask and tooltip placement stay aligned.
    const highlightPadding = step.highlightPadding ?? 8;
    const highlightExtendBottom = step.highlightExtendBottom ?? 0;
    const highlightViewportExtension = step.highlightExtendBottomToViewport
      ? Math.max(0, window.innerHeight - adjustedTargetRect.bottom - highlightPadding)
      : 0;
    const effectiveHighlightExtendBottom =
      highlightExtendBottom + highlightViewportExtension;

    setHighlightRect(adjustedTargetRect);

    // Calculate tooltip position based on specified position
    let top = 0;
    let left = 0;
    const gap = 12; // Gap between tooltip and target

    // Calculate ideal centered position
    const targetCenterX = adjustedTargetRect.left + adjustedTargetRect.width / 2;
    const targetCenterY = adjustedTargetRect.top + adjustedTargetRect.height / 2;

    switch (step.position) {
      case "top":
        top = adjustedTargetRect.top - tooltipRect.height - gap - highlightPadding;
        left = targetCenterX - tooltipRect.width / 2;
        break;
      case "bottom":
        // Position below the extended highlight area
        top =
          adjustedTargetRect.bottom +
          gap +
          effectiveHighlightExtendBottom +
          highlightPadding;
        left = targetCenterX - tooltipRect.width / 2;
        break;
      case "left":
        top = targetCenterY - tooltipRect.height / 2;
        left = adjustedTargetRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = targetCenterY - tooltipRect.height / 2;
        left = adjustedTargetRect.right + gap;
        break;
    }

    // Keep tooltip within viewport bounds
    const viewportPadding = 16;
    if (left < viewportPadding) left = viewportPadding;
    if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - tooltipRect.width - viewportPadding;
    }
    if (top < viewportPadding) top = viewportPadding;
    if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
      top = window.innerHeight - tooltipRect.height - viewportPadding;
    }

    // Calculate arrow position to point at target center
    let arrowTop = 0;
    let arrowLeft = 0;
    const arrowSize = 8;

    switch (step.position) {
      case "top":
        arrowTop = tooltipRect.height - 6;
        // Arrow should point at target center, adjusted for tooltip shift
        arrowLeft = Math.max(12, Math.min(tooltipRect.width - 20, targetCenterX - left - arrowSize));
        break;
      case "bottom":
        arrowTop = -6;
        arrowLeft = Math.max(12, Math.min(tooltipRect.width - 20, targetCenterX - left - arrowSize));
        break;
      case "left":
        arrowLeft = tooltipRect.width - 6;
        arrowTop = Math.max(12, Math.min(tooltipRect.height - 20, targetCenterY - top - arrowSize));
        break;
      case "right":
        arrowLeft = -6;
        arrowTop = Math.max(12, Math.min(tooltipRect.height - 20, targetCenterY - top - arrowSize));
        break;
    }

    setPosition({ top, left });
    setArrowPosition({ top: arrowTop, left: arrowLeft });
  }, [step]);

  useEffect(() => {
    if (!step) return;

    let cancelled = false;

    // schedulePosition: retry until targetRef is populated, then position
    const schedulePosition = () => {
      let attempts = 0;
      const tryUpdate = () => {
        if (cancelled) return;
        if (step.targetRef?.current) {
          updatePosition();
        } else if (attempts < 20) {
          attempts++;
          setTimeout(tryUpdate, 100);
        }
      };
      setTimeout(tryUpdate, 30);
      // For autoScroll steps, re-check after layout shifts (image loads pushing content down)
      if (step.autoScroll) {
        [200, 500, 900].forEach((delay) => {
          setTimeout(() => {
            if (!cancelled && step.targetRef?.current) updatePosition();
          }, delay);
        });
      }
    };

    // Only run onBeforeShow when step id actually changes (not on every re-render).
    // onBeforeShow is responsible for scrolling; it calls onComplete when ready to position.
    if (step.id !== prevStepIdRef.current) {
      prevStepIdRef.current = step.id;
      if (step.onBeforeShow) {
        step.onBeforeShow(schedulePosition);
      } else {
        schedulePosition();
      }
    }

    // Update position on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [step, updatePosition]);

  // Handle click on target element for requiresClick steps (not manualAdvance)
  useEffect(() => {
    if (!step?.requiresClick || step.manualAdvance || !step.targetRef?.current) return;

    const targetEl = step.targetRef.current;
    const handleClick = () => {
      // Small delay to let the click action complete
      setTimeout(onNext, 100);
    };

    targetEl.addEventListener("click", handleClick);
    return () => targetEl.removeEventListener("click", handleClick);
  }, [step, onNext]);

  if (!mounted || !step) return null;

  const highlightPadding = step.highlightPadding ?? 8;
  const highlightExtendBottom = step.highlightExtendBottom ?? 0;
  const highlightViewportExtension =
    step.highlightExtendBottomToViewport && highlightRect
      ? Math.max(0, window.innerHeight - highlightRect.bottom - highlightPadding)
      : 0;
  const effectiveHighlightExtendBottom =
    highlightExtendBottom + highlightViewportExtension;

  const getArrowClasses = () => {
    const base = "absolute w-4 h-4 bg-primary transform rotate-45";
    switch (step.position) {
      case "top":
        return `${base}`;
      case "bottom":
        return `${base}`;
      case "left":
        return `${base}`;
      case "right":
        return `${base}`;
      default:
        return base;
    }
  };

  return createPortal(
    <>
      {/* Overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <mask id="tutorial-spotlight">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - highlightPadding}
                  y={highlightRect.top - highlightPadding}
                  width={highlightRect.width + highlightPadding * 2}
                  height={
                    highlightRect.height +
                    highlightPadding * 2 +
                    effectiveHighlightExtendBottom
                  }
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#tutorial-spotlight)"
          />
        </svg>
      </div>

      {/* Clickable overlay that blocks interaction except for highlighted area (only when requiresClick) */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          // Only create a hole in the overlay if the step requires clicking the target
          // For "showNext" steps, block all clicks including on the highlighted area
          clipPath: highlightRect && (step.requiresClick || step.manualAdvance)
            ? `polygon(
                0% 0%,
                0% 100%,
                ${highlightRect.left - highlightPadding}px 100%,
                ${highlightRect.left - highlightPadding}px ${highlightRect.top - highlightPadding}px,
                ${highlightRect.right + highlightPadding}px ${highlightRect.top - highlightPadding}px,
                ${highlightRect.right + highlightPadding}px ${highlightRect.bottom + highlightPadding + effectiveHighlightExtendBottom}px,
                ${highlightRect.left - highlightPadding}px ${highlightRect.bottom + highlightPadding + effectiveHighlightExtendBottom}px,
                ${highlightRect.left - highlightPadding}px 100%,
                100% 100%,
                100% 0%
              )`
            : undefined,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] bg-primary text-white rounded-xl shadow-2xl p-4 max-w-xs animate-[fadeIn_0.2s_ease-out]"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Arrow */}
        <div
          className={getArrowClasses()}
          style={{
            top: arrowPosition.top,
            left: arrowPosition.left,
          }}
        />

        {/* Content */}
        <div className="relative">
          {/* Step indicator - only show if more than 1 step */}
          {totalSteps > 1 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/70">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>
          )}

          <h4 className="font-semibold text-base mb-1">{step.title}</h4>
          <p className="text-sm text-white/90 mb-4">{step.description}</p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            {step.showSkip !== false && (
              <button
                onClick={onSkip}
                className="text-xs text-white/70 hover:text-white transition-colors"
              >
                Skip Tutorial
              </button>
            )}
            {step.showNext && !step.requiresClick && (
              <button
                onClick={onNext}
                className="ml-auto px-4 py-1.5 bg-white text-primary text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                {step.nextLabel || "Next"}
              </button>
            )}
            {(step.requiresClick || step.manualAdvance) && (
              <span className="ml-auto text-xs text-white/70 italic">
                Click the highlighted area to continue
              </span>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
