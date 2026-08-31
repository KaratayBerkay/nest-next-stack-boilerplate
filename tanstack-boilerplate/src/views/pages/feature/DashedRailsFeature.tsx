"use client";

import { IconChartBar, IconPlug, IconUsers } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature171Card1Title",
    bodyKey: "feature171Card1Body",
    Icon: IconPlug,
  },
  {
    titleKey: "feature171Card2Title",
    bodyKey: "feature171Card2Body",
    Icon: IconUsers,
  },
  {
    titleKey: "feature171Card3Title",
    bodyKey: "feature171Card3Body",
    Icon: IconChartBar,
  },
] as const;

const CONNECTOR_CLASS =
  "border-border pointer-events-none absolute top-[46px] hidden w-8 border-t-2 border-dashed lg:block" as const;

export function DashedRailsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature171Heading}
          </h2>
          <p className="text-muted">{f.feature171Intro}</p>
        </div>
        <div className="relative mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div
            className={`${CONNECTOR_CLASS} left-[calc(33.333%_-_1.333rem)]`}
          />
          <div
            className={`${CONNECTOR_CLASS} left-[calc(66.666%_-_1.333rem)]`}
          />
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              <span className="bg-brand text-brand-fg flex size-11 items-center justify-center rounded-md">
                <card.Icon size={22} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[card.bodyKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
