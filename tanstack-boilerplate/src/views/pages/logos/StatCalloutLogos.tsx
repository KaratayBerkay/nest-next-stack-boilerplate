"use client";

import {
  IconAtom,
  IconDroplet,
  IconFlame,
  IconLeaf,
  IconPrism,
  IconSparkles,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLogosMessages } from "@/types/pages/logos/LogosMessages-types";

interface BrandEntry {
  id: string;
  icon: Icon;
  nameKey: string;
}

const BRANDS: BrandEntry[] = [
  { id: "brand-1", icon: IconPrism, nameKey: "logos4Brand1Name" },
  { id: "brand-2", icon: IconAtom, nameKey: "logos4Brand2Name" },
  { id: "brand-3", icon: IconDroplet, nameKey: "logos4Brand3Name" },
  { id: "brand-4", icon: IconLeaf, nameKey: "logos4Brand4Name" },
  { id: "brand-5", icon: IconFlame, nameKey: "logos4Brand5Name" },
  { id: "brand-6", icon: IconSparkles, nameKey: "logos4Brand6Name" },
];

interface StatEntry {
  id: string;
  valueKey: string;
  labelKey: string;
}

const STATS: StatEntry[] = [
  { id: "stat-1", valueKey: "logos4Stat1Value", labelKey: "logos4Stat1Label" },
  { id: "stat-2", valueKey: "logos4Stat2Value", labelKey: "logos4Stat2Label" },
];

export function StatCalloutLogos() {
  const t = useMessages("pages") as unknown as PagesWithLogosMessages;
  const lg = t.logos;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {lg.logos4Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {lg.logos4Heading}
            </h2>
            <p className="text-muted leading-relaxed">{lg.logos4Intro}</p>
            <div className="mt-2 grid grid-cols-2 gap-6">
              {STATS.map((stat) => (
                <div
                  key={stat.id}
                  className="border-border border-l-2 pl-4"
                >
                  <p className="text-fg text-3xl font-bold tracking-tight lg:text-4xl">
                    {lg[stat.valueKey]}
                  </p>
                  <p className="text-muted mt-1 text-sm">{lg[stat.labelKey]}</p>
                </div>
              ))}
            </div>
          </div>
          <ul
            className="border-border bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-3"
            aria-label={lg.logos4GridAria}
          >
            {BRANDS.map((brand) => (
              <li
                key={brand.id}
                className="bg-bg flex flex-col items-center justify-center gap-2 px-4 py-8 text-center"
              >
                <brand.icon
                  size={22}
                  aria-hidden="true"
                  className="text-muted shrink-0"
                />
                <span className="text-fg text-xs font-semibold tracking-tight">
                  {lg[brand.nameKey]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
