"use client";

import { IconStarFilled } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

const MARQUEE_CSS = `
@keyframes reviews7-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.reviews7-track {
  animation: reviews7-marquee 38s linear infinite;
}
.reviews7-track:hover {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .reviews7-track {
    animation: none;
  }
}
`;

interface ReviewChip {
  id: string;
  rating: number;
  nameKey: string;
  quoteKey: string;
}

const CHIPS: ReviewChip[] = [
  { id: "chip-1", rating: 5, nameKey: "reviews7Chip1Name", quoteKey: "reviews7Chip1Quote" },
  { id: "chip-2", rating: 5, nameKey: "reviews7Chip2Name", quoteKey: "reviews7Chip2Quote" },
  { id: "chip-3", rating: 4, nameKey: "reviews7Chip3Name", quoteKey: "reviews7Chip3Quote" },
  { id: "chip-4", rating: 5, nameKey: "reviews7Chip4Name", quoteKey: "reviews7Chip4Quote" },
  { id: "chip-5", rating: 5, nameKey: "reviews7Chip5Name", quoteKey: "reviews7Chip5Quote" },
  { id: "chip-6", rating: 4, nameKey: "reviews7Chip6Name", quoteKey: "reviews7Chip6Quote" },
  { id: "chip-7", rating: 5, nameKey: "reviews7Chip7Name", quoteKey: "reviews7Chip7Quote" },
  { id: "chip-8", rating: 5, nameKey: "reviews7Chip8Name", quoteKey: "reviews7Chip8Quote" },
];

export function MarqueeStripReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {rv.reviews7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {rv.reviews7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{rv.reviews7Intro}</p>
        </div>

        <div
          className="relative mt-10 overflow-hidden"
          role="list"
          aria-label={rv.reviews7StripAria}
        >
          <style>{MARQUEE_CSS}</style>
          <div className="from-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
          <div className="from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent" />
          <div className="reviews7-track flex w-max items-stretch gap-4">
            {[...CHIPS, ...CHIPS].map((chip, index) => (
              <div
                key={`${chip.id}-${index}`}
                role="listitem"
                className="border-border bg-surface flex w-72 shrink-0 flex-col gap-2 rounded-xl border p-4"
              >
                <div
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label={rv.reviews7RatingAriaTemplate
                    .replace("{name}", rv[chip.nameKey])
                    .replace("{rating}", String(chip.rating))}
                >
                  {Array.from({ length: chip.rating }).map((_, starIndex) => (
                    <IconStarFilled
                      key={starIndex}
                      size={13}
                      aria-hidden="true"
                      className="text-warning"
                    />
                  ))}
                </div>
                <p className="text-fg text-sm leading-relaxed">
                  {rv[chip.quoteKey]}
                </p>
                <p className="text-muted text-xs font-medium">
                  {rv[chip.nameKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
