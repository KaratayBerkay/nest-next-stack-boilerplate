"use client";

import { IconGift } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPromoBannerMessages } from "@/types/pages/promo-banner/PromoBannerMessages-types";

// Demo-only days-left value for the fixed badge — a whole-day countdown
// doesn't need per-second ticking like the hour/minute/second timers do.
const DAYS_LEFT = 12;

const MARQUEE_CSS = `
@keyframes promo-banner-marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-promo-banner-marquee {
  animation: promo-banner-marquee-scroll 22s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-promo-banner-marquee {
    animation: none;
  }
}
`;

interface MarqueeMessage {
  id: string;
  labelKey: string;
}

const MESSAGES: MarqueeMessage[] = [
  { id: "sale", labelKey: "promoBanner6Message1" },
  { id: "wrap", labelKey: "promoBanner6Message2" },
  { id: "returns", labelKey: "promoBanner6Message3" },
];

export function HolidayMarqueeCountdownPromoBanner() {
  const t = useMessages("pages") as unknown as PagesWithPromoBannerMessages;
  const p = t.promoBanner;
  const sequence = [...MESSAGES, ...MESSAGES];

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <style>{MARQUEE_CSS}</style>
      <div className="bg-brand text-brand-fg flex w-full items-stretch">
        <div className="flex shrink-0 items-center px-4 py-3">
          <span className="bg-brand-fg/15 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
            <IconGift size={13} aria-hidden="true" />
            {p.promoBanner6DaysLeft.replace("{count}", String(DAYS_LEFT))}
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden py-3">
          <div className="from-brand pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r to-transparent" />
          <div className="from-brand pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent" />
          <div className="animate-promo-banner-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {sequence.map((message, index) => (
              <span
                key={`${message.id}-${index}`}
                className="text-sm font-medium"
              >
                {p[message.labelKey]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
