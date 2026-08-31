"use client";

import {
  IconArrowUpRight,
  IconBolt,
  IconChartLine,
  IconGitMerge,
  IconMail,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

interface WorkflowItem {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const ITEMS: WorkflowItem[] = [
  {
    id: "automate",
    icon: IconBolt,
    titleKey: "feature118Item1Title",
    bodyKey: "feature118Item1Body",
  },
  {
    id: "merge",
    icon: IconGitMerge,
    titleKey: "feature118Item2Title",
    bodyKey: "feature118Item2Body",
  },
  {
    id: "trends",
    icon: IconChartLine,
    titleKey: "feature118Item3Title",
    bodyKey: "feature118Item3Body",
  },
];

const STATS = [
  { valueKey: "feature118Stat1Value", labelKey: "feature118Stat1Label" },
  { valueKey: "feature118Stat2Value", labelKey: "feature118Stat2Label" },
  { valueKey: "feature118Stat3Value", labelKey: "feature118Stat3Label" },
] as const;

export function WorkflowStackStatsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature118Heading}
            </h2>
            <p className="text-muted leading-relaxed">
              {f.feature118Paragraph}
            </p>
            <a
              href={LINK_URL}
              className="group text-fg inline-flex items-center gap-1.5 text-sm font-medium"
            >
              {f.feature118ContactLabel}
              <IconArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
          <div className="flex flex-col gap-6">
            {ITEMS.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-md">
                  <item.icon size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-fg text-base font-semibold">
                    {f[item.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[item.bodyKey]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-border divide-border mt-14 grid divide-y rounded-lg border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((stat) => (
            <div
              key={stat.valueKey}
              className="flex flex-col items-center gap-1 px-6 py-8 text-center"
            >
              <span className="text-fg text-3xl font-semibold tracking-tight">
                {f[stat.valueKey]}
              </span>
              <span className="text-muted text-sm">{f[stat.labelKey]}</span>
            </div>
          ))}
        </div>
        <div className="border-border mt-8 flex items-center justify-center gap-3 rounded-lg border px-6 py-5">
          <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-md">
            <IconMail size={20} aria-hidden="true" />
          </span>
          <a
            href={LINK_URL}
            className="group text-fg inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {f.feature118ContactLabel}
            <IconArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
