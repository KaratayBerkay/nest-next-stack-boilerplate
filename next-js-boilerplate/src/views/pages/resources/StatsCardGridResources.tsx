"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  IconClockHour4,
  IconPlaylist,
  IconStarFilled,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithResourcesMessages } from "@/types/pages/resources/ResourcesMessages-types";

type Level = "beginner" | "intermediate" | "advanced";
type SortMode = "newest" | "popular" | "rating";
type BadgeVariant = "soft" | "secondary" | "outline";

interface CourseItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  authorNameKey: string;
  durationKey: string;
  lessonsKey: string;
  ratingKey: string;
  level: Level;
  ratingValue: number;
  popularity: number;
  newestRank: number;
}

const LEVEL_LABEL_KEY: Record<Level, string> = {
  beginner: "resources5LevelBeginner",
  intermediate: "resources5LevelIntermediate",
  advanced: "resources5LevelAdvanced",
};

const LEVEL_BADGE_VARIANT: Record<Level, BadgeVariant> = {
  beginner: "soft",
  intermediate: "secondary",
  advanced: "outline",
};

const COURSES: CourseItem[] = [
  {
    id: "api-design",
    titleKey: "resources5Item1Title",
    descriptionKey: "resources5Item1Description",
    authorNameKey: "resources5Item1AuthorName",
    durationKey: "resources5Item1Duration",
    lessonsKey: "resources5Item1Lessons",
    ratingKey: "resources5Item1Rating",
    level: "beginner",
    ratingValue: 4.9,
    popularity: 312,
    newestRank: 2,
  },
  {
    id: "state-management",
    titleKey: "resources5Item2Title",
    descriptionKey: "resources5Item2Description",
    authorNameKey: "resources5Item2AuthorName",
    durationKey: "resources5Item2Duration",
    lessonsKey: "resources5Item2Lessons",
    ratingKey: "resources5Item2Rating",
    level: "advanced",
    ratingValue: 4.7,
    popularity: 198,
    newestRank: 5,
  },
  {
    id: "design-systems",
    titleKey: "resources5Item3Title",
    descriptionKey: "resources5Item3Description",
    authorNameKey: "resources5Item3AuthorName",
    durationKey: "resources5Item3Duration",
    lessonsKey: "resources5Item3Lessons",
    ratingKey: "resources5Item3Rating",
    level: "intermediate",
    ratingValue: 4.8,
    popularity: 256,
    newestRank: 1,
  },
  {
    id: "testing-strategies",
    titleKey: "resources5Item4Title",
    descriptionKey: "resources5Item4Description",
    authorNameKey: "resources5Item4AuthorName",
    durationKey: "resources5Item4Duration",
    lessonsKey: "resources5Item4Lessons",
    ratingKey: "resources5Item4Rating",
    level: "intermediate",
    ratingValue: 4.6,
    popularity: 144,
    newestRank: 6,
  },
  {
    id: "data-pipelines",
    titleKey: "resources5Item5Title",
    descriptionKey: "resources5Item5Description",
    authorNameKey: "resources5Item5AuthorName",
    durationKey: "resources5Item5Duration",
    lessonsKey: "resources5Item5Lessons",
    ratingKey: "resources5Item5Rating",
    level: "beginner",
    ratingValue: 4.5,
    popularity: 97,
    newestRank: 3,
  },
  {
    id: "security-reviews",
    titleKey: "resources5Item6Title",
    descriptionKey: "resources5Item6Description",
    authorNameKey: "resources5Item6AuthorName",
    durationKey: "resources5Item6Duration",
    lessonsKey: "resources5Item6Lessons",
    ratingKey: "resources5Item6Rating",
    level: "advanced",
    ratingValue: 4.9,
    popularity: 289,
    newestRank: 4,
  },
];

function sortCourses(
  items: readonly CourseItem[],
  mode: SortMode,
): CourseItem[] {
  const copy = [...items];
  if (mode === "newest") {
    return copy.sort((a, b) => a.newestRank - b.newestRank);
  }
  if (mode === "popular") {
    return copy.sort((a, b) => b.popularity - a.popularity);
  }
  return copy.sort((a, b) => b.ratingValue - a.ratingValue);
}

export function StatsCardGridResources() {
  const t = useMessages("pages") as unknown as PagesWithResourcesMessages;
  const r = t.resources;
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const sorted = useMemo(() => sortCourses(COURSES, sortMode), [sortMode]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <span className="text-muted text-xs font-semibold tracking-widest uppercase">
              {r.resources5Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {r.resources5Heading}
            </h2>
            <p className="text-muted leading-relaxed">
              {r.resources5Description}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="resources5-sort"
              className="text-muted text-xs font-medium"
            >
              {r.resources5SortLabel}
            </label>
            <NativeSelect
              id="resources5-sort"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="w-44"
            >
              <option value="newest">{r.resources5SortNewest}</option>
              <option value="popular">{r.resources5SortPopular}</option>
              <option value="rating">{r.resources5SortRating}</option>
            </NativeSelect>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((course) => {
            const authorName = r[course.authorNameKey];
            return (
              <Card
                key={course.id}
                variant="default"
                className="overflow-hidden"
              >
                <div className="relative">
                  <AspectRatio ratio={16 / 9}>
                    <Image
                      src={placeholderImage(course.id, "16x9")}
                      alt={r[course.titleKey]}
                      fill
                      sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </AspectRatio>
                  <Badge
                    variant={LEVEL_BADGE_VARIANT[course.level]}
                    size="sm"
                    className="absolute top-3 left-3"
                  >
                    {r[LEVEL_LABEL_KEY[course.level]]}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{r[course.titleKey]}</CardTitle>
                  <CardDescription>{r[course.descriptionKey]}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={placeholderImage(`${course.id}-author`, "1x1")}
                      alt={authorName}
                      fallback={authorName.slice(0, 2)}
                      size="xs"
                    />
                    <span className="text-fg text-sm font-medium">
                      {authorName}
                    </span>
                  </div>
                  <div className="border-border text-muted flex items-center justify-between border-t pt-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <IconClockHour4 size={14} aria-hidden="true" />
                      {r[course.durationKey]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconPlaylist size={14} aria-hidden="true" />
                      {r[course.lessonsKey]}
                    </span>
                    <span className="text-fg flex items-center gap-1 font-medium">
                      <IconStarFilled
                        size={14}
                        className="text-warning"
                        aria-hidden="true"
                      />
                      {r[course.ratingKey]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
