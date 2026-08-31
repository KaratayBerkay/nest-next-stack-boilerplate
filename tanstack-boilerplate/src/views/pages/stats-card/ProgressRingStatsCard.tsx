"use client";

import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsCardMessages } from "@/types/pages/stats-card/StatsCardMessages-types";

const BRAND = "var(--brand)" as const;
const SUCCESS = "var(--success)" as const;
const INFO = "var(--info)" as const;
const WARNING = "var(--warning)" as const;

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RingCard {
  id: string;
  labelKey: string;
  sublabelKey: string;
  deltaKey: string;
  value: number;
  color: string;
}

const CARDS: RingCard[] = [
  {
    id: "ring-1",
    labelKey: "statsCard2Card1Label",
    sublabelKey: "statsCard2Card1Sublabel",
    deltaKey: "statsCard2Card1Delta",
    value: 82,
    color: BRAND,
  },
  {
    id: "ring-2",
    labelKey: "statsCard2Card2Label",
    sublabelKey: "statsCard2Card2Sublabel",
    deltaKey: "statsCard2Card2Delta",
    value: 64,
    color: INFO,
  },
  {
    id: "ring-3",
    labelKey: "statsCard2Card3Label",
    sublabelKey: "statsCard2Card3Sublabel",
    deltaKey: "statsCard2Card3Delta",
    value: 97,
    color: SUCCESS,
  },
  {
    id: "ring-4",
    labelKey: "statsCard2Card4Label",
    sublabelKey: "statsCard2Card4Sublabel",
    deltaKey: "statsCard2Card4Delta",
    value: 45,
    color: WARNING,
  },
];

function RingGauge({ value, color }: { value: number; color: string }) {
  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;
  return (
    <svg
      viewBox="0 0 108 108"
      className="size-28 shrink-0 -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx="54"
        cy="54"
        r={RADIUS}
        fill="none"
        strokeWidth="10"
        className="stroke-surface"
      />
      <circle
        cx="54"
        cy="54"
        r={RADIUS}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        stroke={color}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

export function ProgressRingStatsCard() {
  const t = useMessages("pages") as unknown as PagesWithStatsCardMessages;
  const s = t.statsCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.statsCard2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.statsCard2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.statsCard2Intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <Card key={card.id} variant="default">
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div
                  className="relative flex items-center justify-center"
                  role="img"
                  aria-label={s.statsCard2RingAriaTemplate
                    .replace("{label}", s[card.labelKey])
                    .replace("{value}", `${card.value}%`)}
                >
                  <RingGauge value={card.value} color={card.color} />
                  <span className="text-fg absolute text-xl font-semibold tabular-nums">
                    {card.value}%
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-fg text-sm font-semibold">
                    {s[card.labelKey]}
                  </span>
                  <span className="text-muted text-xs">
                    {s[card.sublabelKey]}
                  </span>
                  <span className="text-brand text-xs font-medium">
                    {s[card.deltaKey]}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
