import { useId } from "react";
import { cn } from "@/lib/cn";

interface FieldMessagesProps {
  error?: string;
  description?: string;
}

export interface FieldMessageIds {
  errorId?: string;
  descriptionId?: string;
}

/**
 * Returns aria-describedby IDs for wiring to a form control.
 * Call with the same error/description values used in the component.
 */
export function useFieldMessageIds(error?: string, description?: string): FieldMessageIds {
  const id = useId();
  return {
    errorId: error ? `${id}-error` : undefined,
    descriptionId: description ? `${id}-description` : undefined,
  };
}

/**
 * Shared error/description message row for form controls.
 * Renders nothing when both error and description are absent.
 */
export function FieldMessages({ error, description }: FieldMessagesProps) {
  if (!error && !description) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {error && (
        <p className="text-error text-xs" role="alert">
          {error}
        </p>
      )}
      {description && (
        <p className="text-muted text-xs">
          {description}
        </p>
      )}
    </div>
  );
}
