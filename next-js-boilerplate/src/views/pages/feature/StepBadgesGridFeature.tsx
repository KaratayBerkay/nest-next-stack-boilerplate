"use client";

import {
  IconChartBar,
  IconPlug,
  IconRocket,
  IconSettings,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature191Card1Title",
    bodyKey: "feature191Card1Body",
    Icon: IconPlug,
    badgeClass: "bg-brand/10 text-brand-fg",
  },
  {
    titleKey: "feature191Card2Title",
    bodyKey: "feature191Card2Body",
    Icon: IconUsers,
    badgeClass: "bg-success/10 text-success",
  },
  {
    titleKey: "feature191Card3Title",
    bodyKey: "feature191Card3Body",
    Icon: IconSettings,
    badgeClass: "bg-brand/10 text-brand-fg",
  },
  {
    titleKey: "feature191Card4Title",
    bodyKey: "feature191Card4Body",
    Icon: IconRocket,
    badgeClass: "bg-success/10 text-success",
  },
  {
    titleKey: "feature191Card5Title",
    bodyKey: "feature191Card5Body",
    Icon: IconChartBar,
    badgeClass: "bg-brand/10 text-brand-fg",
  },
  {
    titleKey: "feature191Card6Title",
    bodyKey: "feature191Card6Body",
    Icon: IconShieldCheck,
    badgeClass: "bg-success/10 text-success",
  },
] as const;

export function StepBadgesGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature191Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature191Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, index) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`${card.badgeClass} flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="border-border bg-surface-hover flex size-10 items-center justify-center rounded-lg border">
                  <card.Icon size={20} className="text-fg" aria-hidden="true" />
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-lg font-semibold">
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
