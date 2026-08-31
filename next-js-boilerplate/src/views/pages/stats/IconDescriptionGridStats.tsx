"use client";

import {
  IconClock,
  IconCoin,
  IconHeadset,
  IconRocket,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithStatsMessages } from "@/types/pages/stats/StatsMessages-types";

interface GridItem {
  id: string;
  icon: Icon;
  valueKey: string;
  headingKey: string;
  descriptionKey: string;
}

const ITEMS: GridItem[] = [
  {
    id: "item-1",
    icon: IconUsers,
    valueKey: "stats5Item1Value",
    headingKey: "stats5Item1Heading",
    descriptionKey: "stats5Item1Description",
  },
  {
    id: "item-2",
    icon: IconCoin,
    valueKey: "stats5Item2Value",
    headingKey: "stats5Item2Heading",
    descriptionKey: "stats5Item2Description",
  },
  {
    id: "item-3",
    icon: IconShieldCheck,
    valueKey: "stats5Item3Value",
    headingKey: "stats5Item3Heading",
    descriptionKey: "stats5Item3Description",
  },
  {
    id: "item-4",
    icon: IconClock,
    valueKey: "stats5Item4Value",
    headingKey: "stats5Item4Heading",
    descriptionKey: "stats5Item4Description",
  },
  {
    id: "item-5",
    icon: IconHeadset,
    valueKey: "stats5Item5Value",
    headingKey: "stats5Item5Heading",
    descriptionKey: "stats5Item5Description",
  },
  {
    id: "item-6",
    icon: IconRocket,
    valueKey: "stats5Item6Value",
    headingKey: "stats5Item6Heading",
    descriptionKey: "stats5Item6Description",
  },
];

export function IconDescriptionGridStats() {
  const t = useMessages("pages") as unknown as PagesWithStatsMessages;
  const sk = t.stats;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {sk.stats5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sk.stats5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sk.stats5Intro}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col gap-3">
              <span className="border-border bg-surface flex size-10 items-center justify-center rounded-lg border">
                <item.icon
                  size={20}
                  aria-hidden="true"
                  className="text-brand"
                />
              </span>
              <span className="text-fg text-3xl font-semibold tracking-tight">
                {sk[item.valueKey]}
              </span>
              <p className="text-fg text-sm font-semibold">
                {sk[item.headingKey]}
              </p>
              <p className="text-muted text-sm leading-relaxed">
                {sk[item.descriptionKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
