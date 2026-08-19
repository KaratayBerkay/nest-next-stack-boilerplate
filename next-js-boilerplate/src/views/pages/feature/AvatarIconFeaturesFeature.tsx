"use client";

import Image from "next/image";
import {
  IconBolt,
  IconChartBar,
  IconShieldCheck,
  IconStarFilled,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const AVATARS = [
  {
    src: "https://picsum.photos/seed/feature93-avatar1/96/96",
    altKey: "feature93Avatar1Alt",
  },
  {
    src: "https://picsum.photos/seed/feature93-avatar2/96/96",
    altKey: "feature93Avatar2Alt",
  },
  {
    src: "https://picsum.photos/seed/feature93-avatar3/96/96",
    altKey: "feature93Avatar3Alt",
  },
  {
    src: "https://picsum.photos/seed/feature93-avatar4/96/96",
    altKey: "feature93Avatar4Alt",
  },
] as const;

const FEATURE_CARDS = [
  {
    Icon: IconBolt,
    titleKey: "feature93Card1Title",
    bodyKey: "feature93Card1Body",
  },
  {
    Icon: IconShieldCheck,
    titleKey: "feature93Card2Title",
    bodyKey: "feature93Card2Body",
  },
  {
    Icon: IconChartBar,
    titleKey: "feature93Card3Title",
    bodyKey: "feature93Card3Body",
  },
] as const;

const STAR_KEYS = [0, 1, 2, 3, 4] as const;

export function AvatarIconFeaturesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <div className="flex -space-x-3">
            {AVATARS.map((avatar) => (
              <Image
                key={avatar.altKey}
                src={avatar.src}
                alt={f[avatar.altKey]}
                width={48}
                height={48}
                className="border-bg size-12 rounded-full border-2 object-cover"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              {STAR_KEYS.map((star) => (
                <IconStarFilled
                  key={star}
                  size={16}
                  className="text-brand"
                  aria-hidden="true"
                />
              ))}
            </span>
            <span className="text-muted text-sm">{f.feature93Rating}</span>
          </div>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature93Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature93Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
            >
              <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-md">
                <card.Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-base font-semibold">
                {f[card.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[card.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
