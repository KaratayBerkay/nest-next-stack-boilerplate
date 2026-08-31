"use client";

import {
  IconArrowUpRight,
  IconChartBar,
  IconHeadset,
  IconSearch,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

interface LinkChip {
  id: string;
  icon: Icon;
  labelKey: string;
}

const CHIPS: LinkChip[] = [
  { id: "plans", icon: IconChartBar, labelKey: "feature288Chip1Label" },
  { id: "sales", icon: IconHeadset, labelKey: "feature288Chip2Label" },
  { id: "docs", icon: IconSearch, labelKey: "feature288Chip3Label" },
];

const STATS = [
  { valueKey: "feature288Stat1Value", labelKey: "feature288Stat1Label" },
  { valueKey: "feature288Stat2Value", labelKey: "feature288Stat2Label" },
  { valueKey: "feature288Stat3Value", labelKey: "feature288Stat3Label" },
] as const;

export function InlineLinkPreviewFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <p className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {f.feature288Para1}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CHIPS.map((chip) => (
              <a
                key={chip.id}
                href={LINK_URL}
                className="border-border hover:bg-surface-hover inline-flex items-center gap-2 rounded-full border px-3 py-1 transition-colors"
              >
                <chip.icon
                  size={16}
                  className="text-brand"
                  aria-hidden="true"
                />
                <span className="text-fg text-sm font-medium">
                  {f[chip.labelKey]}
                </span>
                <IconArrowUpRight size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="text-muted leading-relaxed">{f.feature288Para2}</p>
        </div>
        <div className="border-border divide-border mt-12 grid divide-y rounded-lg border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((stat) => (
            <div
              key={stat.valueKey}
              className="flex flex-col items-center gap-1 px-6 py-6 text-center"
            >
              <span className="text-fg text-2xl font-semibold tracking-tight tabular-nums">
                {f[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{f[stat.labelKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
