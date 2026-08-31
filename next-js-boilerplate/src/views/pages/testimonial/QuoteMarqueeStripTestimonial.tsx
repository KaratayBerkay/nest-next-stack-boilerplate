"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

const MARQUEE_CSS = `
@keyframes testimonial6-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.testimonial6-track {
  animation: testimonial6-marquee 40s linear infinite;
}
.testimonial6-track:hover {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .testimonial6-track {
    animation: none;
  }
}
`;

interface QuoteChip {
  id: string;
  nameKey: string;
  companyKey: string;
  quoteKey: string;
}

const CHIPS: QuoteChip[] = [
  {
    id: "chip-1",
    nameKey: "testimonial6Chip1Name",
    companyKey: "testimonial6Chip1Company",
    quoteKey: "testimonial6Chip1Quote",
  },
  {
    id: "chip-2",
    nameKey: "testimonial6Chip2Name",
    companyKey: "testimonial6Chip2Company",
    quoteKey: "testimonial6Chip2Quote",
  },
  {
    id: "chip-3",
    nameKey: "testimonial6Chip3Name",
    companyKey: "testimonial6Chip3Company",
    quoteKey: "testimonial6Chip3Quote",
  },
  {
    id: "chip-4",
    nameKey: "testimonial6Chip4Name",
    companyKey: "testimonial6Chip4Company",
    quoteKey: "testimonial6Chip4Quote",
  },
  {
    id: "chip-5",
    nameKey: "testimonial6Chip5Name",
    companyKey: "testimonial6Chip5Company",
    quoteKey: "testimonial6Chip5Quote",
  },
  {
    id: "chip-6",
    nameKey: "testimonial6Chip6Name",
    companyKey: "testimonial6Chip6Company",
    quoteKey: "testimonial6Chip6Quote",
  },
  {
    id: "chip-7",
    nameKey: "testimonial6Chip7Name",
    companyKey: "testimonial6Chip7Company",
    quoteKey: "testimonial6Chip7Quote",
  },
  {
    id: "chip-8",
    nameKey: "testimonial6Chip8Name",
    companyKey: "testimonial6Chip8Company",
    quoteKey: "testimonial6Chip8Quote",
  },
];

export function QuoteMarqueeStripTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.testimonial6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.testimonial6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.testimonial6Intro}</p>
        </div>

        <div
          className="relative mt-10 overflow-hidden"
          role="list"
          aria-label={tm.testimonial6StripAria}
        >
          <style>{MARQUEE_CSS}</style>
          <div className="from-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
          <div className="from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent" />
          <div className="testimonial6-track flex w-max items-stretch gap-4">
            {[...CHIPS, ...CHIPS].map((chip, index) => (
              <div
                key={`${chip.id}-${index}`}
                role="listitem"
                className="border-border bg-surface flex w-72 shrink-0 flex-col gap-2 rounded-xl border p-4"
              >
                <p className="text-fg text-sm leading-relaxed">
                  {tm[chip.quoteKey]}
                </p>
                <p className="text-muted text-xs font-medium">
                  {tm[chip.nameKey]} · {tm[chip.companyKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
