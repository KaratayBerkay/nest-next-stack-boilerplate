"use client";

import { useRef } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

interface Phase {
  id: string;
  labelKey: string;
  dateRangeKey: string;
  titleKey: string;
  descriptionKey: string;
}

const PHASES: Phase[] = [
  {
    id: "phase-1",
    labelKey: "timeline2Phase1Label",
    dateRangeKey: "timeline2Phase1DateRange",
    titleKey: "timeline2Phase1Title",
    descriptionKey: "timeline2Phase1Description",
  },
  {
    id: "phase-2",
    labelKey: "timeline2Phase2Label",
    dateRangeKey: "timeline2Phase2DateRange",
    titleKey: "timeline2Phase2Title",
    descriptionKey: "timeline2Phase2Description",
  },
  {
    id: "phase-3",
    labelKey: "timeline2Phase3Label",
    dateRangeKey: "timeline2Phase3DateRange",
    titleKey: "timeline2Phase3Title",
    descriptionKey: "timeline2Phase3Description",
  },
  {
    id: "phase-4",
    labelKey: "timeline2Phase4Label",
    dateRangeKey: "timeline2Phase4DateRange",
    titleKey: "timeline2Phase4Title",
    descriptionKey: "timeline2Phase4Description",
  },
  {
    id: "phase-5",
    labelKey: "timeline2Phase5Label",
    dateRangeKey: "timeline2Phase5DateRange",
    titleKey: "timeline2Phase5Title",
    descriptionKey: "timeline2Phase5Description",
  },
];

const SCROLL_STEP_PX = 336;

export function HorizontalScrollPhasesTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({
      left: direction * SCROLL_STEP_PX,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-2xl flex-col gap-4">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {tl.timeline2Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {tl.timeline2Heading}
            </h2>
            <p className="text-muted leading-relaxed">{tl.timeline2Intro}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <IconButton
              type="button"
              variant="outline"
              size="icon"
              label={tl.timeline2ScrollPrevLabel}
              icon={<IconChevronLeft size={18} />}
              onClick={() => scrollBy(-1)}
            />
            <IconButton
              type="button"
              variant="outline"
              size="icon"
              label={tl.timeline2ScrollNextLabel}
              icon={<IconChevronRight size={18} />}
              onClick={() => scrollBy(1)}
            />
          </div>
        </div>

        <div
          ref={trackRef}
          aria-label={tl.timeline2ListAria}
          role="list"
          className="border-border relative mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pt-6 pb-4 before:absolute before:top-9 before:right-0 before:left-0 before:h-px before:bg-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PHASES.map((phase) => (
            <div
              key={phase.id}
              role="listitem"
              className="relative w-72 shrink-0 snap-start"
            >
              <span
                className="border-border bg-brand relative z-10 mb-4 block size-4 rounded-full border-2 border-bg"
                aria-hidden="true"
              />
              <div className="border-border bg-surface flex h-full flex-col gap-3 rounded-xl border p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                    {tl[phase.labelKey]}
                  </span>
                  <Badge variant="outline" size="sm">
                    {tl[phase.dateRangeKey]}
                  </Badge>
                </div>
                <h3 className="text-fg text-lg font-semibold tracking-tight">
                  {tl[phase.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {tl[phase.descriptionKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
