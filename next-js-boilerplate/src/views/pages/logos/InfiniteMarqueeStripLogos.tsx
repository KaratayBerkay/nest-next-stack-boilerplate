"use client";

import {
  IconAnchor,
  IconCircleDot,
  IconCloud,
  IconFeather,
  IconMountain,
  IconShieldCheck,
  IconSparkles,
  IconStack2,
  IconSun,
  IconTarget,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLogosMessages } from "@/types/pages/logos/LogosMessages-types";

const MARQUEE_CSS = `
@keyframes logos2-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.logos2-track {
  animation: logos2-marquee 34s linear infinite;
}
.logos2-track:hover {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .logos2-track {
    animation: none;
  }
}
`;

interface BrandEntry {
  id: string;
  icon: Icon;
  nameKey: string;
}

const BRANDS: BrandEntry[] = [
  { id: "brand-1", icon: IconSparkles, nameKey: "logos2Brand1Name" },
  { id: "brand-2", icon: IconMountain, nameKey: "logos2Brand2Name" },
  { id: "brand-3", icon: IconSun, nameKey: "logos2Brand3Name" },
  { id: "brand-4", icon: IconShieldCheck, nameKey: "logos2Brand4Name" },
  { id: "brand-5", icon: IconTarget, nameKey: "logos2Brand5Name" },
  { id: "brand-6", icon: IconCircleDot, nameKey: "logos2Brand6Name" },
  { id: "brand-7", icon: IconFeather, nameKey: "logos2Brand7Name" },
  { id: "brand-8", icon: IconAnchor, nameKey: "logos2Brand8Name" },
  { id: "brand-9", icon: IconCloud, nameKey: "logos2Brand9Name" },
  { id: "brand-10", icon: IconStack2, nameKey: "logos2Brand10Name" },
];

export function InfiniteMarqueeStripLogos() {
  const t = useMessages("pages") as unknown as PagesWithLogosMessages;
  const lg = t.logos;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <h2 className="text-fg text-center text-lg font-medium">
          {lg.logos2Heading}
        </h2>
        <style>{MARQUEE_CSS}</style>
        <div
          className="relative mt-10 overflow-hidden"
          role="list"
          aria-label={lg.logos2StripAria}
        >
          <div className="from-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r to-transparent" />
          <div className="from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l to-transparent" />
          <div className="logos2-track flex w-max items-center gap-14">
            {[...BRANDS, ...BRANDS].map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                role="listitem"
                className="flex shrink-0 items-center gap-2.5"
              >
                <brand.icon
                  size={22}
                  aria-hidden="true"
                  className="text-muted shrink-0"
                />
                <span className="text-muted text-xl font-semibold tracking-tight whitespace-nowrap">
                  {lg[brand.nameKey]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
