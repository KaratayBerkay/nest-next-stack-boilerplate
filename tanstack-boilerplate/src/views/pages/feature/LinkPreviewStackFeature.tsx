"use client";

import {
  IconArrowUpRight,
  IconBrandGithub,
  IconCamera,
  IconChartLine,
  IconMusic,
  IconPalette,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

interface PreviewCard {
  icon: Icon;
  titleKey: string;
  bodyKey: string;
  panelClass: string;
}

const CARDS: PreviewCard[] = [
  {
    icon: IconPalette,
    titleKey: "feature289Card1Title",
    bodyKey: "feature289Card1Body",
    panelClass: "lg:col-span-2",
  },
  {
    icon: IconBrandGithub,
    titleKey: "feature289Card2Title",
    bodyKey: "feature289Card2Body",
    panelClass: "",
  },
  {
    icon: IconChartLine,
    titleKey: "feature289Card3Title",
    bodyKey: "feature289Card3Body",
    panelClass: "",
  },
  {
    icon: IconCamera,
    titleKey: "feature289Card4Title",
    bodyKey: "feature289Card4Body",
    panelClass: "",
  },
  {
    icon: IconMusic,
    titleKey: "feature289Card5Title",
    bodyKey: "feature289Card5Body",
    panelClass: "lg:col-span-2",
  },
];

export function LinkPreviewStackFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature289Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature289Intro}</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {CARDS.map((card) => (
            <a
              key={card.titleKey}
              href={LINK_URL}
              className={`border-border bg-surface group hover:bg-surface-hover flex items-center gap-4 rounded-lg border p-5 transition-colors ${card.panelClass}`}
            >
              <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-md">
                <card.icon size={20} aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-fg text-sm font-semibold">
                  {f[card.titleKey]}
                </span>
                <span className="text-muted text-xs leading-relaxed">
                  {f[card.bodyKey]}
                </span>
              </span>
              <IconArrowUpRight
                size={16}
                className="text-muted group-hover:text-brand shrink-0 transition-colors"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
