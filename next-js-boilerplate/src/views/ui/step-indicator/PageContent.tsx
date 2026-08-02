"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

const STEPS = ["Email", "Role", "Message", "Review"];

function InteractiveDemo() {
  const [step, setStep] = useState(0);
  return (
    <div className="flex flex-col gap-4">
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
  );
}

function ReadOnlyDemo() {
  return <StepIndicator steps={STEPS} currentStep={2} />;
}

const examples: UIExample[] = [
  {
    id: "interactive",
    title: "Interactive",
    description: "Click Back/Next to navigate steps.",
    render: () => <InteractiveDemo />,
  },
  {
    id: "read-only",
    title: "Read-only",
    description: "Display-only without onChange.",
    render: () => <ReadOnlyDemo />,
  },
];

export default function StepIndicatorPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Step Indicator"
      intro="Multi-step wizard progress indicator."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
