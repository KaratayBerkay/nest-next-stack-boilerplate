import { useId, type ReactNode } from "react";
import type { FieldMessagesProps } from "@/types/ui/FieldMessages-types";

interface UseFieldMessagesReturn {
  describedBy: string | undefined;
  errorId: string | undefined;
  descriptionId: string | undefined;
  messages: ReactNode;
}

/**
 * Mints stable ids for error/description, renders them as <p> rows,
 * and returns the aria-describedby token for the control.
 * This eliminates id drift — ids are created once and used in both
 * the rendered output and the aria-describedby attribute.
 */
export function useFieldMessages(
  error?: string,
  description?: string,
): UseFieldMessagesReturn {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy =
    [errorId, descriptionId].filter(Boolean).join(" ") || undefined;

  if (!error && !description) {
    return { describedBy: undefined, errorId, descriptionId, messages: null };
  }

  const messages = (
    <div className="mt-1.5 flex flex-col gap-0.5">
      {error && (
        <p
          id={errorId}
          className="text-error flex items-center gap-1 text-xs"
          role="alert"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
      {description && (
        <p id={descriptionId} className="text-muted text-xs">
          {description}
        </p>
      )}
    </div>
  );

  return { describedBy, errorId, descriptionId, messages };
}

/**
 * @deprecated Use `useFieldMessages()` instead — it ensures ids can't drift.
 * Kept only for backwards compatibility during the transition.
 */
export function FieldMessages({ error, description }: FieldMessagesProps) {
  const { messages } = useFieldMessages(error, description);
  return <>{messages}</>;
}
