"use client";

import { cn } from "@/lib/cn";
import type { StepIndicatorProps } from "@/types/ui/StepIndicator-types";

export function StepIndicator({ steps, currentStep, onChange }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="flex items-center gap-2">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === index;
        const isComplete = currentStep > index;
        return (
          <button
            key={index}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(index)}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              isActive && "text-brand font-medium",
              isComplete && "text-success",
              !isActive && !isComplete && "text-muted",
              onChange && "cursor-pointer hover:opacity-80",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-xxs font-medium",
                isActive && "bg-brand text-brand-fg",
                isComplete && "bg-success text-success-fg",
                !isActive && !isComplete && "bg-surface text-muted",
              )}
            >
              {isComplete ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m5 12 5 5 9-9" />
                </svg>
              ) : (
                stepNum
              )}
            </span>
            <span className="hidden sm:inline">{label}</span>
            {index < steps.length - 1 && (
              <span className="text-muted ml-1 h-px w-4 bg-current opacity-30" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
