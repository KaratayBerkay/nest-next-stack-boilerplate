"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Button } from "@/components/ui/Button";

const STEPS = ["Email", "Role", "Message", "Review"];

export default function StepIndicatorPage() {
  const [step, setStep] = useState(0);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">Step Indicator</h2>
        <p className="text-muted text-xs">
          Multi-step wizard progress indicator
        </p>
      </div>
      <div className="surface border-border flex flex-col gap-4 rounded-lg border p-4">
        <StepIndicator steps={STEPS} currentStep={step} onChange={setStep} />
        <div className="flex items-center justify-between">
          <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <Button
            disabled={step >= STEPS.length - 1}
            onClick={() => setStep((s) => s + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="surface border-border flex flex-col gap-4 rounded-lg border p-4">
        <p className="text-xs font-medium">Read-only (no onChange)</p>
        <StepIndicator steps={STEPS} currentStep={2} />
      </div>
    </div>
  );
}
