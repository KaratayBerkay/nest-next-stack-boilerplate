"use client";

import { useId, useState } from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

interface SubmittedReview {
  id: string;
  rating: number;
  name: string;
  body: string;
  dateLabel: string;
  isNew: boolean;
}

interface SeedReview {
  id: string;
  rating: number;
  nameKey: string;
  dateKey: string;
  bodyKey: string;
}

const SEED_REVIEWS: SeedReview[] = [
  {
    id: "seed-1",
    rating: 5,
    nameKey: "reviews9Review1Name",
    dateKey: "reviews9Review1Date",
    bodyKey: "reviews9Review1Body",
  },
  {
    id: "seed-2",
    rating: 4,
    nameKey: "reviews9Review2Name",
    dateKey: "reviews9Review2Date",
    bodyKey: "reviews9Review2Body",
  },
  {
    id: "seed-3",
    rating: 5,
    nameKey: "reviews9Review3Name",
    dateKey: "reviews9Review3Date",
    bodyKey: "reviews9Review3Body",
  },
  {
    id: "seed-4",
    rating: 3,
    nameKey: "reviews9Review4Name",
    dateKey: "reviews9Review4Date",
    bodyKey: "reviews9Review4Body",
  },
];

export function SubmitAndBrowseReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;
  const nameId = useId();
  const bodyId = useId();

  const seeded: SubmittedReview[] = SEED_REVIEWS.map((review) => ({
    id: review.id,
    rating: review.rating,
    name: rv[review.nameKey],
    body: rv[review.bodyKey],
    dateLabel: rv[review.dateKey],
    isNew: false,
  }));

  const [reviews, setReviews] = useState<SubmittedReview[]>(seeded);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const canSubmit = rating > 0 && name.trim().length > 0 && body.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    setReviews((current) => [
      {
        id: `submitted-${Date.now()}`,
        rating,
        name: name.trim(),
        body: body.trim(),
        dateLabel: rv.reviews9JustNowLabel,
        isNew: true,
      },
      ...current,
    ]);
    setRating(0);
    setName("");
    setBody("");
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {rv.reviews9Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {rv.reviews9Heading}
          </h2>
          <p className="text-muted leading-relaxed">{rv.reviews9Intro}</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
            <Card variant="default">
              <div className="flex flex-col gap-4 p-5 @sm:p-6">
                <h3 className="text-fg text-sm font-semibold">
                  {rv.reviews9FormHeading}
                </h3>
                <div className="flex flex-col gap-1.5">
                  <span className="text-fg text-xs font-medium">
                    {rv.reviews9RatingLabel}
                  </span>
                  <div
                    role="radiogroup"
                    aria-label={rv.reviews9RatingLabel}
                    className="flex gap-1"
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = star <= (hoveredStar || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          role="radio"
                          aria-checked={star === rating}
                          aria-label={rv.reviews9StarAriaTemplate.replace(
                            "{n}",
                            String(star),
                          )}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="text-warning p-0.5"
                        >
                          {filled ? (
                            <IconStarFilled size={24} aria-hidden="true" />
                          ) : (
                            <IconStar
                              size={24}
                              aria-hidden="true"
                              className="text-border"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={nameId}>{rv.reviews9NameLabel}</Label>
                  <Input
                    id={nameId}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={rv.reviews9NamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={bodyId}>{rv.reviews9BodyLabel}</Label>
                  <Textarea
                    id={bodyId}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={rv.reviews9BodyPlaceholder}
                    rows={4}
                  />
                </div>
                <Button
                  variant="primary"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  {rv.reviews9SubmitButton}
                </Button>
              </div>
            </Card>
          </div>

          <ul
            className="border-border divide-border divide-y lg:col-span-3"
            aria-label={rv.reviews9ListAria}
          >
            {reviews.map((review) => (
              <li key={review.id} className="flex flex-col gap-2 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-fg text-sm font-semibold">
                      {review.name}
                    </p>
                    {review.isNew && (
                      <Badge variant="success" size="sm">
                        {rv.reviews9NewBadge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted text-xs">
                    {review.dateLabel}
                  </span>
                </div>
                <div
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label={rv.reviews9RatingAriaTemplate
                    .replace("{name}", review.name)
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
                <p className="text-muted text-sm leading-relaxed">
                  {review.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
