"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconBook2,
  IconCode,
  IconCompass,
  IconMicrophone2,
  IconSchool,
  IconVideo,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContentMessages } from "@/types/pages/content/ContentMessages-types";

type FilterKey = "all" | "guides" | "tutorials" | "videos" | "interviews";

const FILTERS: { key: FilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "content2FilterAll" },
  { key: "guides", labelKey: "content2FilterGuides" },
  { key: "tutorials", labelKey: "content2FilterTutorials" },
  { key: "videos", labelKey: "content2FilterVideos" },
  { key: "interviews", labelKey: "content2FilterInterviews" },
];

const TYPES: {
  id: string;
  filter: FilterKey;
  icon: Icon;
  titleKey: string;
  descKey: string;
  countKey: string;
}[] = [
  {
    id: "content2-type-1",
    filter: "guides",
    icon: IconCompass,
    titleKey: "content2Type1Title",
    descKey: "content2Type1Desc",
    countKey: "content2Type1Count",
  },
  {
    id: "content2-type-2",
    filter: "guides",
    icon: IconBook2,
    titleKey: "content2Type2Title",
    descKey: "content2Type2Desc",
    countKey: "content2Type2Count",
  },
  {
    id: "content2-type-3",
    filter: "tutorials",
    icon: IconSchool,
    titleKey: "content2Type3Title",
    descKey: "content2Type3Desc",
    countKey: "content2Type3Count",
  },
  {
    id: "content2-type-4",
    filter: "tutorials",
    icon: IconCode,
    titleKey: "content2Type4Title",
    descKey: "content2Type4Desc",
    countKey: "content2Type4Count",
  },
  {
    id: "content2-type-5",
    filter: "videos",
    icon: IconVideo,
    titleKey: "content2Type5Title",
    descKey: "content2Type5Desc",
    countKey: "content2Type5Count",
  },
  {
    id: "content2-type-6",
    filter: "interviews",
    icon: IconMicrophone2,
    titleKey: "content2Type6Title",
    descKey: "content2Type6Desc",
    countKey: "content2Type6Count",
  },
];

export function FilterableHubGridContent() {
  const t = useMessages("pages") as unknown as PagesWithContentMessages;
  const c = t.content;
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const visibleTypes = TYPES.filter(
    (type) => activeFilter === "all" || type.filter === activeFilter,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-8">
        <div className="flex flex-col gap-4">
          <Badge variant="soft" size="sm" className="w-fit">
            {c.content2Eyebrow}
          </Badge>
          <Typography
            variant="h2"
            className="max-w-2xl text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {c.content2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {c.content2Subtext}
          </Typography>
        </div>

        <div
          role="group"
          aria-label={c.content2Eyebrow}
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
                  isActive
                    ? "bg-brand text-brand-fg border-brand"
                    : "border-border text-muted hover:text-fg hover:bg-surface-hover",
                )}
              >
                {c[filter.labelKey]}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTypes.map((type) => (
            <div
              key={type.id}
              className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6"
            >
              <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-xl">
                <type.icon size={22} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-lg font-semibold tracking-tight">
                  {c[type.titleKey]}
                </h3>
                <Typography variant="bodySmall" className="text-muted">
                  {c[type.descKey]}
                </Typography>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <Badge variant="secondary" size="sm">
                  {c[type.countKey]}
                </Badge>
                <Link
                  href="#"
                  className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {c.content2BrowseLabel}
                  <IconArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
