"use client";

import { useState } from "react";
import { IconBriefcase, IconTrophy } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithListMessages } from "@/types/pages/list/ListMessages-types";

type EntryType = "experience" | "award";
type FilterValue = "all" | EntryType;

interface TimelineSeed {
  id: string;
  type: EntryType;
  titleKey: string;
  subtitleKey: string;
  periodKey: string;
  descriptionKey: string;
}

const TIMELINE_SEEDS: TimelineSeed[] = [
  {
    id: "entry-1",
    type: "experience",
    titleKey: "list3Entry1Title",
    subtitleKey: "list3Entry1Subtitle",
    periodKey: "list3Entry1Period",
    descriptionKey: "list3Entry1Description",
  },
  {
    id: "entry-2",
    type: "award",
    titleKey: "list3Entry2Title",
    subtitleKey: "list3Entry2Subtitle",
    periodKey: "list3Entry2Period",
    descriptionKey: "list3Entry2Description",
  },
  {
    id: "entry-3",
    type: "experience",
    titleKey: "list3Entry3Title",
    subtitleKey: "list3Entry3Subtitle",
    periodKey: "list3Entry3Period",
    descriptionKey: "list3Entry3Description",
  },
  {
    id: "entry-4",
    type: "award",
    titleKey: "list3Entry4Title",
    subtitleKey: "list3Entry4Subtitle",
    periodKey: "list3Entry4Period",
    descriptionKey: "list3Entry4Description",
  },
  {
    id: "entry-5",
    type: "experience",
    titleKey: "list3Entry5Title",
    subtitleKey: "list3Entry5Subtitle",
    periodKey: "list3Entry5Period",
    descriptionKey: "list3Entry5Description",
  },
];

const MARKER_CLASSES: Record<EntryType, string> = {
  experience: "bg-brand/10 text-brand",
  award: "bg-warning/10 text-warning",
};

export function MilestoneTimelineList() {
  const t = useMessages("pages") as unknown as PagesWithListMessages;
  const d = t.list;
  const [filter, setFilter] = useState<FilterValue>("all");

  const entries =
    filter === "all"
      ? TIMELINE_SEEDS
      : TIMELINE_SEEDS.filter((seed) => seed.type === filter);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.list3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.list3Description}
          </Typography>
        </div>

        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as FilterValue)}
        >
          <TabsList>
            <TabsTrigger value="all">{d.list3FilterAll}</TabsTrigger>
            <TabsTrigger value="experience">{d.list3FilterExperience}</TabsTrigger>
            <TabsTrigger value="award">{d.list3FilterAward}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <div
            className="bg-border absolute top-5 bottom-5 left-5 w-px -translate-x-1/2"
            aria-hidden="true"
          />
          <ul className="flex flex-col">
            {entries.map((entry, index) => {
              const EntryIcon = entry.type === "award" ? IconTrophy : IconBriefcase;
              return (
                <li
                  key={entry.id}
                  className={cn(
                    "relative flex gap-5",
                    index < entries.length - 1 && "pb-10",
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full",
                      MARKER_CLASSES[entry.type],
                    )}
                  >
                    <EntryIcon size={18} aria-hidden="true" />
                  </span>
                  <div className="flex flex-1 flex-col gap-1.5 pt-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-fg text-base font-semibold">
                        {d[entry.titleKey]}
                      </span>
                      <Badge variant="outline" size="sm">
                        {d[entry.periodKey]}
                      </Badge>
                    </div>
                    <span className="text-muted text-sm font-medium">
                      {d[entry.subtitleKey]}
                    </span>
                    <p className="text-muted text-sm leading-relaxed">
                      {d[entry.descriptionKey]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
