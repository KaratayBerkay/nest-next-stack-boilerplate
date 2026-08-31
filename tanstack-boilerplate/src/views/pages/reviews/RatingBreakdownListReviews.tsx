"use client";

import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

interface BreakdownRow {
  stars: 5 | 4 | 3 | 2 | 1;
  labelKey: string;
  percent: number;
}

const BREAKDOWN: BreakdownRow[] = [
  { stars: 5, labelKey: "reviews1Star5Label", percent: 72 },
  { stars: 4, labelKey: "reviews1Star4Label", percent: 18 },
  { stars: 3, labelKey: "reviews1Star3Label", percent: 6 },
  { stars: 2, labelKey: "reviews1Star2Label", percent: 3 },
  { stars: 1, labelKey: "reviews1Star1Label", percent: 1 },
];

const AVERAGE_RATING = 4.8;
const TOTAL_REVIEW_COUNT = "1,284";

interface ReviewEntry {
  id: string;
  rating: number;
  nameKey: string;
  dateKey: string;
  titleKey: string;
  bodyKey: string;
}

const REVIEWS: ReviewEntry[] = [
  {
    id: "review-1",
    rating: 5,
    nameKey: "reviews1Review1Name",
    dateKey: "reviews1Review1Date",
    titleKey: "reviews1Review1Title",
    bodyKey: "reviews1Review1Body",
  },
  {
    id: "review-2",
    rating: 5,
    nameKey: "reviews1Review2Name",
    dateKey: "reviews1Review2Date",
    titleKey: "reviews1Review2Title",
    bodyKey: "reviews1Review2Body",
  },
  {
    id: "review-3",
    rating: 4,
    nameKey: "reviews1Review3Name",
    dateKey: "reviews1Review3Date",
    titleKey: "reviews1Review3Title",
    bodyKey: "reviews1Review3Body",
  },
  {
    id: "review-4",
    rating: 5,
    nameKey: "reviews1Review4Name",
    dateKey: "reviews1Review4Date",
    titleKey: "reviews1Review4Title",
    bodyKey: "reviews1Review4Body",
  },
  {
    id: "review-5",
    rating: 3,
    nameKey: "reviews1Review5Name",
    dateKey: "reviews1Review5Date",
    titleKey: "reviews1Review5Title",
    bodyKey: "reviews1Review5Body",
  },
];

function StarRow({
  rating,
  ariaLabel,
}: {
  rating: number;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={ariaLabel}>
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating ? (
          <IconStarFilled
            key={n}
            size={14}
            aria-hidden="true"
            className="text-warning"
          />
        ) : (
          <IconStar
            key={n}
            size={14}
            aria-hidden="true"
            className="text-border"
          />
        ),
      )}
    </div>
  );
}

export function RatingBreakdownListReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {rv.reviews1Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {rv.reviews1Heading}
            </h2>
            <p className="text-muted leading-relaxed">{rv.reviews1Intro}</p>
            <div className="border-border bg-surface rounded-xl border p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-fg text-5xl font-bold tracking-tight">
                  {AVERAGE_RATING}
                </span>
                <span className="text-muted text-sm">
                  {rv.reviews1AverageSuffix}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StarRow rating={5} ariaLabel={rv.reviews1AverageRatingAria} />
                <span className="text-muted text-xs">
                  {rv.reviews1CountTemplate.replace(
                    "{count}",
                    TOTAL_REVIEW_COUNT,
                  )}
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                {BREAKDOWN.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="text-muted w-14 shrink-0 text-xs">
                      {rv[row.labelKey]}
                    </span>
                    <Progress value={row.percent} size="sm" className="flex-1" />
                    <span className="text-muted w-9 shrink-0 text-right text-xs tabular-nums">
                      {row.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ul
            className="border-border divide-border divide-y lg:col-span-3"
            aria-label={rv.reviews1ListAria}
          >
            {REVIEWS.map((review) => (
              <li key={review.id} className="flex flex-col gap-2 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-fg text-sm font-semibold">
                    {rv[review.nameKey]}
                  </p>
                  <span className="text-muted text-xs">
                    {rv[review.dateKey]}
                  </span>
                </div>
                <StarRow
                  rating={review.rating}
                  ariaLabel={rv.reviews1RatingAriaTemplate
                    .replace("{name}", rv[review.nameKey])
                    .replace("{rating}", String(review.rating))}
                />
                <p className="text-fg text-sm font-medium">
                  {rv[review.titleKey]}
                </p>
                <p className="text-muted text-sm leading-relaxed">
                  {rv[review.bodyKey]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
