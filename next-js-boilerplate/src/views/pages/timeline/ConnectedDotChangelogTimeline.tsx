"use client";

import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

interface ChangelogEntry {
  id: string;
  versionKey: string;
  dateKey: string;
  titleKey: string;
  descriptionKey: string;
  tagKey: string;
  tagVariant: BadgeVariant;
}

const ENTRIES: ChangelogEntry[] = [
  {
    id: "entry-1",
    versionKey: "timeline3Entry1Version",
    dateKey: "timeline3Entry1Date",
    titleKey: "timeline3Entry1Title",
    descriptionKey: "timeline3Entry1Description",
    tagKey: "timeline3TagFeature",
    tagVariant: "success",
  },
  {
    id: "entry-2",
    versionKey: "timeline3Entry2Version",
    dateKey: "timeline3Entry2Date",
    titleKey: "timeline3Entry2Title",
    descriptionKey: "timeline3Entry2Description",
    tagKey: "timeline3TagImprovement",
    tagVariant: "info",
  },
  {
    id: "entry-3",
    versionKey: "timeline3Entry3Version",
    dateKey: "timeline3Entry3Date",
    titleKey: "timeline3Entry3Title",
    descriptionKey: "timeline3Entry3Description",
    tagKey: "timeline3TagFix",
    tagVariant: "warning",
  },
  {
    id: "entry-4",
    versionKey: "timeline3Entry4Version",
    dateKey: "timeline3Entry4Date",
    titleKey: "timeline3Entry4Title",
    descriptionKey: "timeline3Entry4Description",
    tagKey: "timeline3TagFeature",
    tagVariant: "success",
  },
  {
    id: "entry-5",
    versionKey: "timeline3Entry5Version",
    dateKey: "timeline3Entry5Date",
    titleKey: "timeline3Entry5Title",
    descriptionKey: "timeline3Entry5Description",
    tagKey: "timeline3TagFix",
    tagVariant: "warning",
  },
  {
    id: "entry-6",
    versionKey: "timeline3Entry6Version",
    dateKey: "timeline3Entry6Date",
    titleKey: "timeline3Entry6Title",
    descriptionKey: "timeline3Entry6Description",
    tagKey: "timeline3TagImprovement",
    tagVariant: "info",
  },
];

export function ConnectedDotChangelogTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tl.timeline3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tl.timeline3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tl.timeline3Intro}</p>
        </div>

        <ol
          aria-label={tl.timeline3ListAria}
          className="border-border divide-border mt-12 flex flex-col divide-y border-l"
        >
          {ENTRIES.map((entry) => (
            <li key={entry.id} className="relative py-6 pl-8">
              <span
                className="border-bg bg-brand absolute top-7 -left-[7px] size-3 rounded-full border-2"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-fg font-mono text-sm font-semibold">
                  {tl[entry.versionKey]}
                </span>
                <Badge variant={entry.tagVariant} size="sm">
                  {tl[entry.tagKey]}
                </Badge>
                <span className="text-muted ml-auto text-xs">
                  {tl[entry.dateKey]}
                </span>
              </div>
              <h3 className="text-fg mt-2 text-base font-semibold tracking-tight">
                {tl[entry.titleKey]}
              </h3>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {tl[entry.descriptionKey]}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
