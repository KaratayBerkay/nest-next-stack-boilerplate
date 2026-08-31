"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

const MARQUEE_CSS = `
@keyframes integration7-marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes integration7-marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
.integration7-track-a {
  animation: integration7-marquee-left 42s linear infinite;
}
.integration7-track-b {
  animation: integration7-marquee-right 36s linear infinite;
}
.integration7-track-a:hover,
.integration7-track-b:hover {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .integration7-track-a,
  .integration7-track-b {
    animation: none;
  }
}
`;

const ROW_ONE_KEYS = [
  "integration7Tool1Name",
  "integration7Tool2Name",
  "integration7Tool3Name",
  "integration7Tool4Name",
  "integration7Tool5Name",
  "integration7Tool6Name",
  "integration7Tool7Name",
  "integration7Tool8Name",
];

const ROW_TWO_KEYS = [
  "integration7Tool9Name",
  "integration7Tool10Name",
  "integration7Tool11Name",
  "integration7Tool12Name",
  "integration7Tool13Name",
  "integration7Tool14Name",
  "integration7Tool15Name",
  "integration7Tool16Name",
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface RowProps {
  nameKeys: string[];
  trackClass: string;
  ariaLabel: string;
  ig: Record<string, string>;
}

function MarqueeRow({ nameKeys, trackClass, ariaLabel, ig }: RowProps) {
  const names = nameKeys.map((key) => ig[key]);
  const doubled = [...names, ...names];

  return (
    <div
      className="relative overflow-hidden"
      role="list"
      aria-label={ariaLabel}
    >
      <div className={`${trackClass} flex w-max items-stretch gap-4`}>
        {doubled.map((name, index) => (
          <div
            key={`${name}-${index}`}
            role="listitem"
            className="border-border bg-surface flex shrink-0 items-center gap-3 rounded-full border px-5 py-2.5"
          >
            <span className="bg-brand/15 text-brand flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
              {initialsFor(name)}
            </span>
            <span className="text-fg text-sm font-medium whitespace-nowrap">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScrollingLogoWallIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {ig.integration7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {ig.integration7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{ig.integration7Intro}</p>
        </div>

        <div className="relative mt-10 flex flex-col gap-4">
          <style>{MARQUEE_CSS}</style>
          <div className="from-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
          <div className="from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent" />
          <MarqueeRow
            nameKeys={ROW_ONE_KEYS}
            trackClass="integration7-track-a"
            ariaLabel={ig.integration7StripAriaRow1}
            ig={ig}
          />
          <MarqueeRow
            nameKeys={ROW_TWO_KEYS}
            trackClass="integration7-track-b"
            ariaLabel={ig.integration7StripAriaRow2}
            ig={ig}
          />
        </div>
      </div>
    </section>
  );
}
