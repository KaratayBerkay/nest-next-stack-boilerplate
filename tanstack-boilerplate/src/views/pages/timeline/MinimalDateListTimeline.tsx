"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

interface DateEntry {
  id: string;
  dateKey: string;
  textKey: string;
}

const ENTRIES: DateEntry[] = [
  { id: "d-1", dateKey: "timeline6Entry1Date", textKey: "timeline6Entry1Text" },
  { id: "d-2", dateKey: "timeline6Entry2Date", textKey: "timeline6Entry2Text" },
  { id: "d-3", dateKey: "timeline6Entry3Date", textKey: "timeline6Entry3Text" },
  { id: "d-4", dateKey: "timeline6Entry4Date", textKey: "timeline6Entry4Text" },
  { id: "d-5", dateKey: "timeline6Entry5Date", textKey: "timeline6Entry5Text" },
  { id: "d-6", dateKey: "timeline6Entry6Date", textKey: "timeline6Entry6Text" },
  { id: "d-7", dateKey: "timeline6Entry7Date", textKey: "timeline6Entry7Text" },
];

export function MinimalDateListTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tl.timeline6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tl.timeline6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tl.timeline6Intro}</p>
        </div>

        <ol
          aria-label={tl.timeline6ListAria}
          className="divide-border mt-10 flex flex-col divide-y"
        >
          {ENTRIES.map((entry) => (
            <li
              key={entry.id}
              className="grid grid-cols-[6rem_1fr] items-baseline gap-4 py-4 sm:grid-cols-[8rem_1fr]"
            >
              <span className="text-muted font-mono text-xs tabular-nums">
                {tl[entry.dateKey]}
              </span>
              <span className="text-fg text-sm leading-relaxed">
                {tl[entry.textKey]}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
