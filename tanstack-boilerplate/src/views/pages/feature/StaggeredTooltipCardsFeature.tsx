"use client";

import {
  IconChartBar,
  IconCloud,
  IconLock,
  IconWand,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface StaggerCard {
  id: string;
  icon: Icon;
  offset: string;
  titleKey: string;
  detailKey: string;
}

const STAGGER_CARDS: StaggerCard[] = [
  {
    id: "automate",
    icon: IconWand,
    offset: "lg:translate-y-0",
    titleKey: "feature266Card1Title",
    detailKey: "feature266Card1Detail",
  },
  {
    id: "secure",
    icon: IconLock,
    offset: "lg:translate-y-8",
    titleKey: "feature266Card2Title",
    detailKey: "feature266Card2Detail",
  },
  {
    id: "scale",
    icon: IconCloud,
    offset: "lg:translate-y-0",
    titleKey: "feature266Card3Title",
    detailKey: "feature266Card3Detail",
  },
  {
    id: "measure",
    icon: IconChartBar,
    offset: "lg:translate-y-8",
    titleKey: "feature266Card4Title",
    detailKey: "feature266Card4Detail",
  },
];

export function StaggeredTooltipCardsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature266Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl">{f.feature266Intro}</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STAGGER_CARDS.map((card) => (
            <HoverCard key={card.id} openDelay={100}>
              <HoverCardTrigger asChild>
                <div
                  className={`border-border bg-surface hover:border-brand/40 flex cursor-default flex-col gap-3 rounded-lg border p-5 transition-transform ${card.offset}`}
                >
                  <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <card.icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="text-fg text-sm font-semibold">
                    {f[card.titleKey]}
                  </h3>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-muted text-sm leading-relaxed">
                  {f[card.detailKey]}
                </p>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </section>
  );
}
