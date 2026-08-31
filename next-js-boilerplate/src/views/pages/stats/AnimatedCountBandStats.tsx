"use client";

import {
  IconServer,
  IconStar,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsMessages } from "@/types/pages/stats/StatsMessages-types";
import { formatCountValue, useCountUp } from "./useCountUp";

interface StatEntry {
  id: string;
  icon: Icon;
  target: number;
  decimals: number;
  prefix: string;
  suffix: string;
  labelKey: string;
  blurbKey: string;
}

const STATS: StatEntry[] = [
  {
    id: "customers",
    icon: IconUsers,
    target: 48000,
    decimals: 0,
    prefix: "",
    suffix: "+",
    labelKey: "stats1Stat1Label",
    blurbKey: "stats1Stat1Blurb",
  },
  {
    id: "countries",
    icon: IconWorld,
    target: 142,
    decimals: 0,
    prefix: "",
    suffix: "",
    labelKey: "stats1Stat2Label",
    blurbKey: "stats1Stat2Blurb",
  },
  {
    id: "uptime",
    icon: IconServer,
    target: 99.98,
    decimals: 2,
    prefix: "",
    suffix: "%",
    labelKey: "stats1Stat3Label",
    blurbKey: "stats1Stat3Blurb",
  },
  {
    id: "rating",
    icon: IconStar,
    target: 4.9,
    decimals: 1,
    prefix: "",
    suffix: "/5",
    labelKey: "stats1Stat4Label",
    blurbKey: "stats1Stat4Blurb",
  },
];

function StatCell({
  stat,
  sk,
}: {
  stat: StatEntry;
  sk: Record<string, string>;
}) {
  const value = useCountUp(stat.target);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="border-border bg-surface flex size-12 items-center justify-center rounded-full border">
        <stat.icon size={22} aria-hidden="true" className="text-brand" />
      </span>
      <span className="text-fg text-4xl font-semibold tracking-tight tabular-nums lg:text-5xl">
        {stat.prefix}
        {formatCountValue(value, stat.decimals)}
        {stat.suffix}
      </span>
      <p className="text-fg text-sm font-semibold">{sk[stat.labelKey]}</p>
      <p className="text-muted max-w-56 text-sm leading-relaxed">
        {sk[stat.blurbKey]}
      </p>
    </div>
  );
}

export function AnimatedCountBandStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center lg:px-8">
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          {sk.stats1Eyebrow}
        </span>
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {sk.stats1Heading}
        </h2>
        <p className="text-muted max-w-2xl leading-relaxed">{sk.stats1Intro}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-12 px-6 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
          <StatCell key={stat.id} stat={stat} sk={sk} />
        ))}
      </div>
    </section>
  );
}
