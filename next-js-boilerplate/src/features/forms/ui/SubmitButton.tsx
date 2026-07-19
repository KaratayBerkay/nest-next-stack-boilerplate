"use client";

import { useStore } from "@tanstack/react-form";
import { useFormContext } from "@/lib/forms/form-context";
import { Button } from "@/components/ui/Button";
import type { SubmitButtonProps } from "@/types/forms/SubmitButton-types";

export function SubmitButton({ label, loadingLabel, onClick }: SubmitButtonProps) {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  return (
    <Button type={onClick ? "button" : "submit"} disabled={isSubmitting} aria-busy={isSubmitting} onClick={onClick}>
      {isSubmitting ? loadingLabel ?? "Saving..." : label ?? "Submit"}
    </Button>
  );
}
