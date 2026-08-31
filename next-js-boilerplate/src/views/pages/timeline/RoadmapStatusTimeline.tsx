"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithTimelineMessages } from "@/types/pages/timeline/TimelineMessages-types";

type Status = "done" | "in-progress" | "planned";
type StatusFilter = "all" | Status;

interface RoadmapItem {
  id: string;
  quarterKey: string;
  titleKey: string;
  descriptionKey: string;
  status: Status;
}

const STATUS_VARIANT: Record<Status, BadgeVariant> = {
  done: "success",
  "in-progress": "info",
  planned: "outline",
};

const STATUS_LABEL_KEY: Record<Status, string> = {
  done: "timeline5StatusDone",
  "in-progress": "timeline5StatusInProgress",
  planned: "timeline5StatusPlanned",
};

const ITEMS: RoadmapItem[] = [
  {
    id: "item-1",
    quarterKey: "timeline5Item1Quarter",
    titleKey: "timeline5Item1Title",
    descriptionKey: "timeline5Item1Description",
    status: "done",
  },
  {
    id: "item-2",
    quarterKey: "timeline5Item2Quarter",
    titleKey: "timeline5Item2Title",
    descriptionKey: "timeline5Item2Description",
    status: "done",
  },
  {
    id: "item-3",
    quarterKey: "timeline5Item3Quarter",
    titleKey: "timeline5Item3Title",
    descriptionKey: "timeline5Item3Description",
    status: "in-progress",
  },
  {
    id: "item-4",
    quarterKey: "timeline5Item4Quarter",
    titleKey: "timeline5Item4Title",
    descriptionKey: "timeline5Item4Description",
    status: "in-progress",
  },
  {
    id: "item-5",
    quarterKey: "timeline5Item5Quarter",
    titleKey: "timeline5Item5Title",
    descriptionKey: "timeline5Item5Description",
    status: "planned",
  },
  {
    id: "item-6",
    quarterKey: "timeline5Item6Quarter",
    titleKey: "timeline5Item6Title",
    descriptionKey: "timeline5Item6Description",
    status: "planned",
  },
];

const FILTERS: { id: StatusFilter; labelKey: string }[] = [
  { id: "all", labelKey: "timeline5FilterAll" },
  { id: "done", labelKey: "timeline5StatusDone" },
  { id: "in-progress", labelKey: "timeline5StatusInProgress" },
  { id: "planned", labelKey: "timeline5StatusPlanned" },
];

export function RoadmapStatusTimeline() {
  const t = useMessages("pages") as unknown as PagesWithTimelineMessages;
  const tl = t.timeline;
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return ITEMS;
    return ITEMS.filter((item) => item.status === filter);
  }, [filter]);

  const doneCount = ITEMS.filter((item) => item.status === "done").length;
  const percentDone = Math.round((doneCount / ITEMS.length) * 100);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tl.timeline5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tl.timeline5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tl.timeline5Intro}</p>
        </div>

        <div className="border-border bg-surface mt-8 flex flex-col gap-3 rounded-xl border p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-fg font-medium">
              {tl.timeline5ProgressLabel}
            </span>
            <span className="text-muted">
              {tl.timeline5ProgressTemplate.replace(
                "{percent}",
                String(percentDone),
              )}
            </span>
          </div>
          <Progress value={percentDone} size="md" />
        </div>

        <div className="mt-8 flex justify-start">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as StatusFilter);
            }}
            aria-label={tl.timeline5FilterGroupAria}
          >
            {FILTERS.map((f) => (
              <ToggleGroupItem key={f.id} value={f.id} size="sm">
                {tl[f.labelKey]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <ol
          aria-label={tl.timeline5ListAria}
          className="border-border divide-border mt-8 flex flex-col divide-y border-l"
        >
          {filtered.map((item) => (
            <li key={item.id} className="relative py-5 pl-8">
              <span
                className={`border-bg absolute top-6 -left-[7px] size-3 rounded-full border-2 ${
                  item.status === "done"
                    ? "bg-success"
                    : item.status === "in-progress"
                      ? "bg-info"
                      : "bg-muted"
                }`}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                  {tl[item.quarterKey]}
                </span>
                <Badge variant={STATUS_VARIANT[item.status]} size="sm">
                  {tl[STATUS_LABEL_KEY[item.status]]}
                </Badge>
              </div>
              <h3 className="text-fg mt-2 text-base font-semibold tracking-tight">
                {tl[item.titleKey]}
              </h3>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {tl[item.descriptionKey]}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
