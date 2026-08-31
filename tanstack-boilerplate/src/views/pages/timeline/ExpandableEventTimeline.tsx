"use client";

import { IconChevronDown, IconClock, IconMapPin, IconMicrophone2 } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

interface EventEntry {
  id: string;
  timeKey: string;
  titleKey: string;
  descriptionKey: string;
  speakerKey: string;
  locationKey: string;
}

const EVENTS: EventEntry[] = [
  {
    id: "event-1",
    timeKey: "timeline4Event1Time",
    titleKey: "timeline4Event1Title",
    descriptionKey: "timeline4Event1Description",
    speakerKey: "timeline4Event1Speaker",
    locationKey: "timeline4Event1Location",
  },
  {
    id: "event-2",
    timeKey: "timeline4Event2Time",
    titleKey: "timeline4Event2Title",
    descriptionKey: "timeline4Event2Description",
    speakerKey: "timeline4Event2Speaker",
    locationKey: "timeline4Event2Location",
  },
  {
    id: "event-3",
    timeKey: "timeline4Event3Time",
    titleKey: "timeline4Event3Title",
    descriptionKey: "timeline4Event3Description",
    speakerKey: "timeline4Event3Speaker",
    locationKey: "timeline4Event3Location",
  },
  {
    id: "event-4",
    timeKey: "timeline4Event4Time",
    titleKey: "timeline4Event4Title",
    descriptionKey: "timeline4Event4Description",
    speakerKey: "timeline4Event4Speaker",
    locationKey: "timeline4Event4Location",
  },
];

export function ExpandableEventTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tl.timeline4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tl.timeline4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tl.timeline4Intro}</p>
        </div>

        <ol
          aria-label={tl.timeline4ListAria}
          className="border-border mt-12 flex flex-col gap-4 border-l pl-8"
        >
          {EVENTS.map((event) => (
            <li key={event.id} className="relative">
              <span
                className="border-bg bg-brand absolute top-4 -left-[calc(2rem+7px)] size-3 rounded-full border-2"
                aria-hidden="true"
              />
              <Collapsible className="border-border bg-surface rounded-xl border">
                <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left [&[data-state=open]_svg.chev]:rotate-180">
                  <span className="text-muted flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap">
                    <IconClock size={14} aria-hidden="true" />
                    {tl[event.timeKey]}
                  </span>
                  <span className="text-fg min-w-0 flex-1 truncate text-sm font-semibold">
                    {tl[event.titleKey]}
                  </span>
                  <IconChevronDown
                    size={16}
                    aria-hidden="true"
                    className="chev text-muted shrink-0 transition-transform"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <p className="text-muted text-sm leading-relaxed">
                    {tl[event.descriptionKey]}
                  </p>
                  <div className="text-muted mt-3 flex flex-wrap gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <IconMicrophone2 size={14} aria-hidden="true" />
                      {tl[event.speakerKey]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconMapPin size={14} aria-hidden="true" />
                      {tl[event.locationKey]}
                    </span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
