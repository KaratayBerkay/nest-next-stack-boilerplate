"use client";

import {
  IconActivity,
  IconArchive,
  IconDownload,
  IconFilter,
  IconKeyboard,
  IconSearch,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface HoverCard {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const FEATURE_276_CARDS: HoverCard[] = [
  {
    id: "search",
    icon: IconSearch,
    titleKey: "feature276Card1Title",
    bodyKey: "feature276Card1Body",
  },
  {
    id: "filters",
    icon: IconFilter,
    titleKey: "feature276Card2Title",
    bodyKey: "feature276Card2Body",
  },
  {
    id: "shortcuts",
    icon: IconKeyboard,
    titleKey: "feature276Card3Title",
    bodyKey: "feature276Card3Body",
  },
  {
    id: "activity",
    icon: IconActivity,
    titleKey: "feature276Card4Title",
    bodyKey: "feature276Card4Body",
  },
  {
    id: "archive",
    icon: IconArchive,
    titleKey: "feature276Card5Title",
    bodyKey: "feature276Card5Body",
  },
  {
    id: "exports",
    icon: IconDownload,
    titleKey: "feature276Card6Title",
    bodyKey: "feature276Card6Body",
  },
];

export function HoverHighlightGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge pill>{f.feature276Pill}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature276Heading}
          </h2>
          <p className="text-muted">{f.feature276Intro}</p>
        </div>
        <div className="group mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_276_CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6 transition-opacity duration-200 group-hover:opacity-40 hover:!opacity-100"
            >
              <div className="flex items-center gap-3">
                <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <card.icon size={20} aria-hidden="true" />
                </span>
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
              </div>
              <p className="text-muted text-sm">{f[card.bodyKey]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
