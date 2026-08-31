"use client";

import type { FormErrorBannerProps } from "@/types/ui/FormErrorBanner-types";

export function FormErrorBanner({ message, onDismiss }: FormErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="border-error/30 bg-error/10 text-error flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
    >
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="hover:bg-error/10 shrink-0 rounded p-1 transition-colors"
          aria-label="Dismiss"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
