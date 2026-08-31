"use client";

import { useState } from "react";
import {
  IconCircleCheckFilled,
  IconStar,
  IconStarFilled,
  IconThumbUp,
  IconThumbUpFilled,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

interface MasonryReview {
  id: string;
  initials: string;
  rating: number;
  helpfulSeed: number;
  nameKey: string;
  dateKey: string;
  bodyKey: string;
}

const REVIEWS: MasonryReview[] = [
  {
    id: "photo-1",
    initials: "AK",
    rating: 5,
    helpfulSeed: 24,
    nameKey: "reviews3Review1Name",
    dateKey: "reviews3Review1Date",
    bodyKey: "reviews3Review1Body",
  },
  {
    id: "photo-2",
    initials: "GM",
    rating: 4,
    helpfulSeed: 9,
    nameKey: "reviews3Review2Name",
    dateKey: "reviews3Review2Date",
    bodyKey: "reviews3Review2Body",
  },
  {
    id: "photo-3",
    initials: "PL",
    rating: 5,
    helpfulSeed: 41,
    nameKey: "reviews3Review3Name",
    dateKey: "reviews3Review3Date",
    bodyKey: "reviews3Review3Body",
  },
  {
    id: "photo-4",
    initials: "HB",
    rating: 3,
    helpfulSeed: 6,
    nameKey: "reviews3Review4Name",
    dateKey: "reviews3Review4Date",
    bodyKey: "reviews3Review4Body",
  },
  {
    id: "photo-5",
    initials: "CV",
    rating: 5,
    helpfulSeed: 17,
    nameKey: "reviews3Review5Name",
    dateKey: "reviews3Review5Date",
    bodyKey: "reviews3Review5Body",
  },
  {
    id: "photo-6",
    initials: "EO",
    rating: 4,
    helpfulSeed: 12,
    nameKey: "reviews3Review6Name",
    dateKey: "reviews3Review6Date",
    bodyKey: "reviews3Review6Body",
  },
  {
    id: "photo-7",
    initials: "TS",
    rating: 5,
    helpfulSeed: 30,
    nameKey: "reviews3Review7Name",
    dateKey: "reviews3Review7Date",
    bodyKey: "reviews3Review7Body",
  },
  {
    id: "photo-8",
    initials: "WY",
    rating: 4,
    helpfulSeed: 3,
    nameKey: "reviews3Review8Name",
    dateKey: "reviews3Review8Date",
    bodyKey: "reviews3Review8Body",
  },
];

const INITIAL_HELPFUL: Record<string, number> = Object.fromEntries(
  REVIEWS.map((review) => [review.id, review.helpfulSeed]),
);

export function PhotoMasonryWallReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;
  const [helpful, setHelpful] =
    useState<Record<string, number>>(INITIAL_HELPFUL);
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  function toggleHelpful(id: string) {
    setVoted((current) => {
      const next = { ...current, [id]: !current[id] };
      setHelpful((counts) => ({
        ...counts,
        [id]: counts[id] + (next[id] ? 1 : -1),
      }));
      return next;
    });
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {rv.reviews3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {rv.reviews3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{rv.reviews3Intro}</p>
        </div>

        <div
          className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3"
          role="list"
          aria-label={rv.reviews3GridAria}
        >
          {REVIEWS.map((review) => {
            const isVoted = Boolean(voted[review.id]);
            return (
              <div
                key={review.id}
                role="listitem"
                className="mb-4 break-inside-avoid"
              >
                <Card variant="default">
                  <div className="flex flex-col gap-3 p-4 @sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          fallback={review.initials}
                          size="sm"
                          variant="default"
                        />
                        <div>
                          <p className="text-fg text-sm font-semibold">
                            {rv[review.nameKey]}
                          </p>
                          <p className="text-muted text-xs">
                            {rv[review.dateKey]}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-success flex items-center gap-1 text-xs font-medium"
                        title={rv.reviews3VerifiedBadge}
                      >
                        <IconCircleCheckFilled size={14} aria-hidden="true" />
                        <span className="hidden @sm:inline">
                          {rv.reviews3VerifiedBadge}
                        </span>
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-0.5"
                      role="img"
                      aria-label={rv.reviews3RatingAriaTemplate
                        .replace("{name}", rv[review.nameKey])
                        .replace("{rating}", String(review.rating))}
                    >
                      {[1, 2, 3, 4, 5].map((n) =>
                        n <= review.rating ? (
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
                    <p className="text-muted text-sm leading-relaxed">
                      {rv[review.bodyKey]}
                    </p>
                    <button
                      type="button"
                      aria-pressed={isVoted}
                      onClick={() => toggleHelpful(review.id)}
                      className={cn(
                        "flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        isVoted
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border text-muted hover:bg-surface-hover",
                      )}
                    >
                      {isVoted ? (
                        <IconThumbUpFilled size={14} aria-hidden="true" />
                      ) : (
                        <IconThumbUp size={14} aria-hidden="true" />
                      )}
                      {rv.reviews3HelpfulButtonTemplate.replace(
                        "{count}",
                        String(helpful[review.id]),
                      )}
                    </button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
