"use client";

import { useMemo, useState } from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { CheckboxChip } from "@/components/ui/Checkbox";
import { Empty } from "@/components/ui/Empty";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

interface FilterableReview {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  nameKey: string;
  titleKey: string;
  bodyKey: string;
}

const REVIEWS: FilterableReview[] = [
  {
    id: "fr-1",
    rating: 5,
    nameKey: "reviews4Review1Name",
    titleKey: "reviews4Review1Title",
    bodyKey: "reviews4Review1Body",
  },
  {
    id: "fr-2",
    rating: 5,
    nameKey: "reviews4Review2Name",
    titleKey: "reviews4Review2Title",
    bodyKey: "reviews4Review2Body",
  },
  {
    id: "fr-3",
    rating: 4,
    nameKey: "reviews4Review3Name",
    titleKey: "reviews4Review3Title",
    bodyKey: "reviews4Review3Body",
  },
  {
    id: "fr-4",
    rating: 4,
    nameKey: "reviews4Review4Name",
    titleKey: "reviews4Review4Title",
    bodyKey: "reviews4Review4Body",
  },
  {
    id: "fr-5",
    rating: 3,
    nameKey: "reviews4Review5Name",
    titleKey: "reviews4Review5Title",
    bodyKey: "reviews4Review5Body",
  },
  {
    id: "fr-6",
    rating: 5,
    nameKey: "reviews4Review6Name",
    titleKey: "reviews4Review6Title",
    bodyKey: "reviews4Review6Body",
  },
  {
    id: "fr-7",
    rating: 2,
    nameKey: "reviews4Review7Name",
    titleKey: "reviews4Review7Title",
    bodyKey: "reviews4Review7Body",
  },
  {
    id: "fr-8",
    rating: 5,
    nameKey: "reviews4Review8Name",
    titleKey: "reviews4Review8Title",
    bodyKey: "reviews4Review8Body",
  },
  {
    id: "fr-9",
    rating: 1,
    nameKey: "reviews4Review9Name",
    titleKey: "reviews4Review9Title",
    bodyKey: "reviews4Review9Body",
  },
  {
    id: "fr-10",
    rating: 4,
    nameKey: "reviews4Review10Name",
    titleKey: "reviews4Review10Title",
    bodyKey: "reviews4Review10Body",
  },
];

const STAR_FILTERS: { stars: 5 | 4 | 3 | 2 | 1; labelKey: string }[] = [
  { stars: 5, labelKey: "reviews4Star5Chip" },
  { stars: 4, labelKey: "reviews4Star4Chip" },
  { stars: 3, labelKey: "reviews4Star3Chip" },
  { stars: 2, labelKey: "reviews4Star2Chip" },
  { stars: 1, labelKey: "reviews4Star1Chip" },
];

export function FilterByStarReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;
  const [activeStars, setActiveStars] = useState<number[]>([]);

  const filtered = useMemo(() => {
    if (activeStars.length === 0) return REVIEWS;
    return REVIEWS.filter((review) => activeStars.includes(review.rating));
  }, [activeStars]);

  function toggleStar(stars: number, checked: boolean) {
    setActiveStars((current) =>
      checked
        ? [...current, stars]
        : current.filter((value) => value !== stars),
    );
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {rv.reviews4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {rv.reviews4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{rv.reviews4Intro}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <span className="text-muted text-xs font-medium tracking-wide uppercase">
            {rv.reviews4FilterGroupLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {STAR_FILTERS.map((filter) => {
              const count = REVIEWS.filter(
                (review) => review.rating === filter.stars,
              ).length;
              return (
                <CheckboxChip
                  key={filter.stars}
                  label={rv[filter.labelKey]}
                  checked={activeStars.includes(filter.stars)}
                  onChange={(checked) => toggleStar(filter.stars, checked)}
                  count={count}
                />
              );
            })}
            {activeStars.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveStars([])}
              >
                {rv.reviews4ClearFiltersButton}
              </Button>
            )}
          </div>
          <p className="text-muted text-xs">
            {rv.reviews4CountTemplate
              .replace("{shown}", String(filtered.length))
              .replace("{total}", String(REVIEWS.length))}
          </p>
        </div>

        {filtered.length === 0 ? (
          <Empty
            className="mt-8"
            title={rv.reviews4EmptyTitle}
            description={rv.reviews4EmptyDescription}
            action={
              <Button variant="outline" size="sm" onClick={() => setActiveStars([])}>
                {rv.reviews4ClearFiltersButton}
              </Button>
            }
          />
        ) : (
          <ul
            className="border-border divide-border mt-8 divide-y border-t"
            aria-label={rv.reviews4ListAria}
          >
            {filtered.map((review) => (
              <li key={review.id} className="flex flex-col gap-2 py-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-fg text-sm font-semibold">
                    {rv[review.nameKey]}
                  </p>
                  <div
                    className="flex items-center gap-0.5"
                    role="img"
                    aria-label={rv.reviews4RatingAriaTemplate
                      .replace("{name}", rv[review.nameKey])
                      .replace("{rating}", String(review.rating))}
                  >
                    {[1, 2, 3, 4, 5].map((n) =>
                      n <= review.rating ? (
                        <IconStarFilled
                          key={n}
                          size={13}
                          aria-hidden="true"
                          className="text-warning"
                        />
                      ) : (
                        <IconStar
                          key={n}
                          size={13}
                          aria-hidden="true"
                          className="text-border"
                        />
                      ),
                    )}
                  </div>
                </div>
                <p className="text-fg text-sm font-medium">
                  {rv[review.titleKey]}
                </p>
                <p className="text-muted text-sm leading-relaxed">
                  {rv[review.bodyKey]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
