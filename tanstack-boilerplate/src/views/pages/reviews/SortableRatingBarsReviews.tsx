"use client";

import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/Progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

type SortKey = "recent" | "highest" | "lowest" | "helpful";

interface BarReview {
  id: string;
  rating: number;
  order: number;
  helpfulCount: number;
  nameKey: string;
  dateKey: string;
  bodyKey: string;
}

const REVIEWS: BarReview[] = [
  {
    id: "bar-1",
    rating: 5,
    order: 7,
    helpfulCount: 38,
    nameKey: "reviews8Review1Name",
    dateKey: "reviews8Review1Date",
    bodyKey: "reviews8Review1Body",
  },
  {
    id: "bar-2",
    rating: 3,
    order: 6,
    helpfulCount: 5,
    nameKey: "reviews8Review2Name",
    dateKey: "reviews8Review2Date",
    bodyKey: "reviews8Review2Body",
  },
  {
    id: "bar-3",
    rating: 5,
    order: 5,
    helpfulCount: 21,
    nameKey: "reviews8Review3Name",
    dateKey: "reviews8Review3Date",
    bodyKey: "reviews8Review3Body",
  },
  {
    id: "bar-4",
    rating: 4,
    order: 4,
    helpfulCount: 14,
    nameKey: "reviews8Review4Name",
    dateKey: "reviews8Review4Date",
    bodyKey: "reviews8Review4Body",
  },
  {
    id: "bar-5",
    rating: 2,
    order: 3,
    helpfulCount: 2,
    nameKey: "reviews8Review5Name",
    dateKey: "reviews8Review5Date",
    bodyKey: "reviews8Review5Body",
  },
  {
    id: "bar-6",
    rating: 5,
    order: 2,
    helpfulCount: 46,
    nameKey: "reviews8Review6Name",
    dateKey: "reviews8Review6Date",
    bodyKey: "reviews8Review6Body",
  },
  {
    id: "bar-7",
    rating: 4,
    order: 1,
    helpfulCount: 9,
    nameKey: "reviews8Review7Name",
    dateKey: "reviews8Review7Date",
    bodyKey: "reviews8Review7Body",
  },
];

const SORT_OPTIONS: { value: SortKey; labelKey: string }[] = [
  { value: "recent", labelKey: "reviews8SortRecentOption" },
  { value: "highest", labelKey: "reviews8SortHighestOption" },
  { value: "lowest", labelKey: "reviews8SortLowestOption" },
  { value: "helpful", labelKey: "reviews8SortHelpfulOption" },
];

function sortReviews(reviews: BarReview[], sortKey: SortKey): BarReview[] {
  const sorted = [...reviews];
  if (sortKey === "highest") sorted.sort((a, b) => b.rating - a.rating);
  else if (sortKey === "lowest") sorted.sort((a, b) => a.rating - b.rating);
  else if (sortKey === "helpful")
    sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
  else sorted.sort((a, b) => b.order - a.order);
  return sorted;
}

export function SortableRatingBarsReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const sorted = useMemo(() => sortReviews(REVIEWS, sortKey), [sortKey]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-md flex-col gap-3">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {rv.reviews8Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {rv.reviews8Heading}
            </h2>
            <p className="text-muted leading-relaxed">{rv.reviews8Intro}</p>
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-52">
            <span className="text-muted text-xs font-medium tracking-wide uppercase">
              {rv.reviews8SortLabel}
            </span>
            <Select
              value={sortKey}
              onValueChange={(value) => setSortKey(value as SortKey)}
              name="reviews8-sort"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {rv[option.labelKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ul
          className="border-border divide-border mt-8 divide-y border-t"
          aria-label={rv.reviews8ListAria}
        >
          {sorted.map((review) => (
            <li key={review.id} className="flex flex-col gap-2 py-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-fg text-sm font-semibold">
                  {rv[review.nameKey]}
                </p>
                <span className="text-muted text-xs">
                  {rv[review.dateKey]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={(review.rating / 5) * 100}
                  size="sm"
                  className="max-w-40"
                  aria-label={rv.reviews8RatingAriaTemplate
                    .replace("{name}", rv[review.nameKey])
                    .replace("{rating}", String(review.rating))}
                />
                <span className="text-muted text-xs tabular-nums">
                  {review.rating.toFixed(1)} / 5
                </span>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                {rv[review.bodyKey]}
              </p>
              <p className="text-muted text-xs">
                {rv.reviews8HelpfulCountTemplate.replace(
                  "{count}",
                  String(review.helpfulCount),
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
