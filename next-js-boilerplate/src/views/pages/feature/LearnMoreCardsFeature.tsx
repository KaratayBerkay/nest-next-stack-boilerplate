"use client";

import {
  IconBolt,
  IconLock,
  IconPuzzle,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface LearnMoreCard {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
  linkKey: string;
}

const LINK_URL = "#" as const;

const FEATURE_194_CARDS: LearnMoreCard[] = [
  {
    id: "speed",
    icon: IconBolt,
    titleKey: "feature194Card1Title",
    bodyKey: "feature194Card1Body",
    linkKey: "feature194Card1Link",
  },
  {
    id: "reliability",
    icon: IconShieldCheck,
    titleKey: "feature194Card2Title",
    bodyKey: "feature194Card2Body",
    linkKey: "feature194Card2Link",
  },
  {
    id: "security",
    icon: IconLock,
    titleKey: "feature194Card3Title",
    bodyKey: "feature194Card3Body",
    linkKey: "feature194Card3Link",
  },
  {
    id: "extensibility",
    icon: IconPuzzle,
    titleKey: "feature194Card4Title",
    bodyKey: "feature194Card4Body",
    linkKey: "feature194Card4Link",
  },
];

export function LearnMoreCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge>{f.feature194Eyebrow}</Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature194Title}
          </h2>
          <p className="text-muted">{f.feature194Subline}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_194_CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-lg">
                <card.icon size={22} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-fg text-base font-semibold">
                  {f[card.titleKey]}
                </h3>
                <p className="text-muted text-sm">{f[card.bodyKey]}</p>
              </div>
              <Button variant="outline" className="mt-auto w-full" asChild>
                <a href={LINK_URL}>{f[card.linkKey]}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
