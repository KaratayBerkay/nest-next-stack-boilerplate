"use client";

import {
  IconBuildingSkyscraper,
  IconRocket,
  IconTrophy,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

interface Milestone {
  id: string;
  icon: Icon;
  yearKey: string;
  titleKey: string;
  descriptionKey: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "milestone-1",
    icon: IconRocket,
    yearKey: "timeline1Milestone1Year",
    titleKey: "timeline1Milestone1Title",
    descriptionKey: "timeline1Milestone1Description",
  },
  {
    id: "milestone-2",
    icon: IconUsers,
    yearKey: "timeline1Milestone2Year",
    titleKey: "timeline1Milestone2Title",
    descriptionKey: "timeline1Milestone2Description",
  },
  {
    id: "milestone-3",
    icon: IconBuildingSkyscraper,
    yearKey: "timeline1Milestone3Year",
    titleKey: "timeline1Milestone3Title",
    descriptionKey: "timeline1Milestone3Description",
  },
  {
    id: "milestone-4",
    icon: IconWorld,
    yearKey: "timeline1Milestone4Year",
    titleKey: "timeline1Milestone4Title",
    descriptionKey: "timeline1Milestone4Description",
  },
  {
    id: "milestone-5",
    icon: IconTrophy,
    yearKey: "timeline1Milestone5Year",
    titleKey: "timeline1Milestone5Title",
    descriptionKey: "timeline1Milestone5Description",
  },
];

export function AlternatingMilestonesTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tl.timeline1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tl.timeline1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tl.timeline1Intro}</p>
        </div>

        <ol
          aria-label={tl.timeline1ListAria}
          className="before:bg-border relative mt-16 flex flex-col gap-10 before:absolute before:top-0 before:bottom-0 before:left-5 before:w-px md:gap-14 md:before:left-1/2 md:before:-translate-x-1/2"
        >
          {MILESTONES.map((milestone, index) => {
            const alignEnd = index % 2 === 1;
            return (
              <li
                key={milestone.id}
                className="relative pl-14 md:grid md:grid-cols-2 md:gap-10 md:pl-0"
              >
                <span
                  className="border-border bg-bg text-brand absolute top-0 left-5 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border-2 md:left-1/2"
                  aria-hidden="true"
                >
                  <milestone.icon size={18} />
                </span>
                <div className={cn(alignEnd ? "md:col-start-2" : "md:col-start-1")}>
                  <div
                    className={cn(
                      "border-border bg-surface rounded-xl border p-5",
                      alignEnd ? "md:text-left" : "md:text-right",
                    )}
                  >
                    <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                      {tl[milestone.yearKey]}
                    </span>
                    <h3 className="text-fg mt-1 text-lg font-semibold tracking-tight">
                      {tl[milestone.titleKey]}
                    </h3>
                    <p className="text-muted mt-2 text-sm leading-relaxed">
                      {tl[milestone.descriptionKey]}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
