"use client";

import { Button } from "@/components/ui/Button";
import { validateEmail } from "./EmailsStep";
import type { NavigationButtonsProps } from "@/types/views/forms/NavigationButtons-types";

export function NavigationButtons({
  step,
  setStep,
  canNext,
  setEmailInputError,
  t,
  form,
}: NavigationButtonsProps) {
  const handleNext = () => {
    // The emails step stages a typed address in a scratch `emailInput` field
    // until Enter/Add commits it to the `emails` list — advancing straight
    // to the next step silently abandoned whatever was still sitting there.
    if (step === 0) {
      const pending: string = form.state.values.emailInput;
      if (pending.trim()) {
        const error = validateEmail(pending, form.state.values.emails, t);
        if (error) {
          setEmailInputError(error);
          return;
        }
        form.pushFieldValue("emails", pending.trim().toLowerCase());
        form.setFieldValue("emailInput", "");
      }
    }
    setEmailInputError(null);
    setStep((s) => Math.min(3, s + 1));
  };

  return (
    <div className="flex justify-between">
      <Button
        type="button"
        variant="outline"
        disabled={step === 0}
        onClick={() => setStep((s) => Math.max(0, s - 1))}
      >
        {t.back as string}
      </Button>
      {step < 3 ? (
        <Button type="button" disabled={!canNext} onClick={handleNext}>
          {t.next as string}
        </Button>
      ) : (
        <form.AppForm>
          <form.SubmitButton
            label={t.send as string}
            loadingLabel={t.sending as string}
          />
        </form.AppForm>
      )}
    </div>
  );
}
