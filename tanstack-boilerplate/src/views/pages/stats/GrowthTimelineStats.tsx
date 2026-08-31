"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsMessages } from "@/types/pages/stats/StatsMessages-types";

interface Milestone {
  id: string;
  yearKey: string;
  valueKey: string;
  labelKey: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "milestone-1",
    yearKey: "stats7Milestone1Year",
    valueKey: "stats7Milestone1Value",
    labelKey: "stats7Milestone1Label",
  },
  {
    id: "milestone-2",
    yearKey: "stats7Milestone2Year",
    valueKey: "stats7Milestone2Value",
    labelKey: "stats7Milestone2Label",
  },
  {
    id: "milestone-3",
    yearKey: "stats7Milestone3Year",
    valueKey: "stats7Milestone3Value",
    labelKey: "stats7Milestone3Label",
  },
  {
    id: "milestone-4",
    yearKey: "stats7Milestone4Year",
    valueKey: "stats7Milestone4Value",
    labelKey: "stats7Milestone4Label",
  },
  {
    id: "milestone-5",
    yearKey: "stats7Milestone5Year",
    valueKey: "stats7Milestone5Value",
    labelKey: "stats7Milestone5Label",
  },
];

export function GrowthTimelineStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {sk.stats7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sk.stats7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sk.stats7Intro}</p>
        </div>
        <ol
          aria-label={sk.stats7TimelineAria}
          className="flex flex-col gap-8 sm:grid sm:grid-cols-5 sm:gap-6"
        >
          {MILESTONES.map((milestone, index) => (
            <li key={milestone.id} className="relative flex sm:flex-col">
              <div className="flex flex-col items-center sm:w-full">
                <span
                  className="border-brand bg-bg text-brand relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                {index === MILESTONES.length - 1 ? null : (
                  <span
                    className="bg-border ml-[18px] w-px flex-1 sm:mt-0 sm:ml-0 sm:h-px sm:w-full sm:flex-none sm:translate-y-[18px]"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="ml-4 flex flex-1 flex-col gap-1 pb-2 sm:mt-4 sm:ml-0 sm:pb-0 sm:text-center">
                <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                  {sk[milestone.yearKey]}
                </span>
                <span className="text-fg text-2xl font-semibold tracking-tight">
                  {sk[milestone.valueKey]}
                </span>
                <span className="text-muted text-sm leading-relaxed">
                  {sk[milestone.labelKey]}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
