"use client";

import {
  IconBell,
  IconKeyboard,
  IconLock,
  IconSettings,
  IconUsers,
  IconWand,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature278Card1Title",
    bodyKey: "feature278Card1Body",
    Icon: IconKeyboard,
  },
  {
    titleKey: "feature278Card2Title",
    bodyKey: "feature278Card2Body",
    Icon: IconBell,
  },
  {
    titleKey: "feature278Card3Title",
    bodyKey: "feature278Card3Body",
    Icon: IconWand,
  },
  {
    titleKey: "feature278Card4Title",
    bodyKey: "feature278Card4Body",
    Icon: IconUsers,
  },
  {
    titleKey: "feature278Card5Title",
    bodyKey: "feature278Card5Body",
    Icon: IconSettings,
  },
  {
    titleKey: "feature278Card6Title",
    bodyKey: "feature278Card6Body",
    Icon: IconLock,
  },
] as const;

export function MutedGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature278Heading}
          </h2>
          <p className="text-muted">{f.feature278Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="bg-surface flex flex-col gap-4 rounded-lg p-6"
            >
              <span className="text-muted flex size-10 items-center justify-center rounded-md">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
