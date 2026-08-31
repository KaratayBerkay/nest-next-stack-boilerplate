"use client";

import {
  IconAdjustmentsHorizontal,
  IconMailCheck,
  IconRocket,
  IconUserPlus,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

interface ProcessStep {
  id: string;
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
  durationKey: string;
}

const STEPS: ProcessStep[] = [
  {
    id: "process-1",
    icon: IconUserPlus,
    titleKey: "timeline8Step1Title",
    descriptionKey: "timeline8Step1Description",
    durationKey: "timeline8Step1Duration",
  },
  {
    id: "process-2",
    icon: IconMailCheck,
    titleKey: "timeline8Step2Title",
    descriptionKey: "timeline8Step2Description",
    durationKey: "timeline8Step2Duration",
  },
  {
    id: "process-3",
    icon: IconAdjustmentsHorizontal,
    titleKey: "timeline8Step3Title",
    descriptionKey: "timeline8Step3Description",
    durationKey: "timeline8Step3Duration",
  },
  {
    id: "process-4",
    icon: IconRocket,
    titleKey: "timeline8Step4Title",
    descriptionKey: "timeline8Step4Description",
    durationKey: "timeline8Step4Duration",
  },
];

export function IconStepProcessTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tl.timeline8Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tl.timeline8Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tl.timeline8Intro}</p>
        </div>

        <ol
          aria-label={tl.timeline8ListAria}
          className="mt-12 flex flex-col"
        >
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;
            return (
              <li key={step.id} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="border-border bg-bg text-brand flex size-11 shrink-0 items-center justify-center rounded-full border-2">
                    <step.icon size={20} aria-hidden="true" />
                  </span>
                  {!isLast && (
                    <span
                      className="bg-border my-1 w-px flex-1"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-8"}`}>
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    <h3 className="text-fg text-base font-semibold tracking-tight">
                      {tl[step.titleKey]}
                    </h3>
                    <Badge variant="soft" size="sm">
                      {tl[step.durationKey]}
                    </Badge>
                  </div>
                  <p className="text-muted mt-1.5 text-sm leading-relaxed">
                    {tl[step.descriptionKey]}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
