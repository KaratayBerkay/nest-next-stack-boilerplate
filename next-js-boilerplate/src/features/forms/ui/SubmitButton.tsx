"use client";

import { useStore } from "@tanstack/react-form";
import { useFormContext } from "@/lib/forms/form-context";
import { Button } from "@/components/ui/Button";
import type { SubmitButtonProps } from "@/types/forms/SubmitButton-types";

export function SubmitButton({ label, loadingLabel }: SubmitButtonProps) {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  return (
    <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
      {isSubmitting ? loadingLabel ?? "Saving..." : label ?? "Submit"}
    </Button>
  );
}
