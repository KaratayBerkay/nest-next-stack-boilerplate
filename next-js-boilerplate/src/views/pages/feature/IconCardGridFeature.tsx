"use client";

import {
  IconArrowRight,
  IconAutomation,
  IconChartBar,
  IconCode,
  IconMessageStar,
  IconPlugConnected,
  IconSearch,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const CARDS = [
  {
    titleKey: "feature18Card1Title",
    bodyKey: "feature18Card1Body",
    linkKey: "feature18Card1Link",
    Icon: IconSearch,
  },
  {
    titleKey: "feature18Card2Title",
    bodyKey: "feature18Card2Body",
    linkKey: "feature18Card2Link",
    Icon: IconAutomation,
  },
  {
    titleKey: "feature18Card3Title",
    bodyKey: "feature18Card3Body",
    linkKey: "feature18Card3Link",
    Icon: IconPlugConnected,
  },
  {
    titleKey: "feature18Card4Title",
    bodyKey: "feature18Card4Body",
    linkKey: "feature18Card4Link",
    Icon: IconChartBar,
  },
  {
    titleKey: "feature18Card5Title",
    bodyKey: "feature18Card5Body",
    linkKey: "feature18Card5Link",
    Icon: IconMessageStar,
  },
  {
    titleKey: "feature18Card6Title",
    bodyKey: "feature18Card6Body",
    linkKey: "feature18Card6Link",
    Icon: IconCode,
  },
] as const;

export function IconCardGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 flex max-w-2xl flex-col items-start gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature18Heading}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface group hover:bg-surface-hover flex flex-col gap-4 rounded-lg border p-6 transition-colors"
            >
              <span className="bg-brand text-brand-fg flex size-10 items-center justify-center rounded-md">
                <card.Icon size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[card.bodyKey]}
                </p>
              </div>
              <a
                href={LINK_URL}
                className="text-fg mt-auto inline-flex items-center gap-1.5 text-sm font-medium"
              >
                {f[card.linkKey]}
                <IconArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
