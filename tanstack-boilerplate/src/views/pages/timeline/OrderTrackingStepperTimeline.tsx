"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

interface OrderStep {
  id: string;
  labelKey: string;
  dateKey: string;
  descriptionKey: string;
}

const STEPS: OrderStep[] = [
  {
    id: "step-1",
    labelKey: "timeline7Step1Label",
    dateKey: "timeline7Step1Date",
    descriptionKey: "timeline7Step1Description",
  },
  {
    id: "step-2",
    labelKey: "timeline7Step2Label",
    dateKey: "timeline7Step2Date",
    descriptionKey: "timeline7Step2Description",
  },
  {
    id: "step-3",
    labelKey: "timeline7Step3Label",
    dateKey: "timeline7Step3Date",
    descriptionKey: "timeline7Step3Description",
  },
  {
    id: "step-4",
    labelKey: "timeline7Step4Label",
    dateKey: "timeline7Step4Date",
    descriptionKey: "timeline7Step4Description",
  },
  {
    id: "step-5",
    labelKey: "timeline7Step5Label",
    dateKey: "timeline7Step5Date",
    descriptionKey: "timeline7Step5Description",
  },
];

const ACTUAL_STATUS_INDEX = 2;

export function OrderTrackingStepperTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;
  const [selectedStep, setSelectedStep] = useState<number>(
    ACTUAL_STATUS_INDEX,
  );

  const active = STEPS[selectedStep];
  const percent = Math.round((selectedStep / (STEPS.length - 1)) * 100);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tl.timeline7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tl.timeline7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tl.timeline7Intro}</p>
        </div>

        <div className="border-border bg-surface mt-10 flex flex-col gap-6 rounded-xl border p-6">
          <StepIndicator
            steps={STEPS.map((step) => tl[step.labelKey])}
            currentStep={selectedStep}
            onChange={setSelectedStep}
          />
          <Progress value={percent} size="sm" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-fg text-base font-semibold tracking-tight">
                {tl[active.labelKey]}
              </span>
              <span className="text-muted text-xs">{tl[active.dateKey]}</span>
            </div>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              {tl[active.descriptionKey]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
