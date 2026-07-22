"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/Button";

interface NavigationButtonsProps {
  step: number;
  setStep: (updater: (prev: number) => number) => void;
  canNext: boolean;
  t: Record<string, unknown>;
  form: any;
}

export function NavigationButtons({
  step,
  setStep,
  canNext,
  t,
  form,
}: NavigationButtonsProps) {
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
        <Button
          type="button"
          disabled={!canNext}
          onClick={() => setStep((s) => Math.min(3, s + 1))}
        >
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
