import { useId, type ReactNode } from "react";

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
    <div className="flex flex-col gap-0.5">
      {error && (
        <p id={errorId} className="text-error text-xs" role="alert">
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

interface FieldMessagesProps {
  error?: string;
  description?: string;
}

/**
 * @deprecated Use `useFieldMessages()` instead — it ensures ids can't drift.
 * Kept only for backwards compatibility during the transition.
 */
export function FieldMessages({ error, description }: FieldMessagesProps) {
  const { messages } = useFieldMessages(error, description);
  return <>{messages}</>;
}
