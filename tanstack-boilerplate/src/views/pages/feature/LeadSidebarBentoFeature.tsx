"use client";

import Image from "next/image";
import {
  IconArrowRight,
  IconEye,
  IconGauge,
  IconRocket,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface SidebarCard {
  id: string;
  icon: Icon;
  titleKey: string;
  bodyKey: string;
}

const SIDEBAR_CARDS: SidebarCard[] = [
  {
    id: "truth",
    icon: IconEye,
    titleKey: "feature59Card1Title",
    bodyKey: "feature59Card1Body",
  },
  {
    id: "live",
    icon: IconGauge,
    titleKey: "feature59Card2Title",
    bodyKey: "feature59Card2Body",
  },
  {
    id: "ready",
    icon: IconRocket,
    titleKey: "feature59Card3Title",
    bodyKey: "feature59Card3Body",
  },
];

const IMAGE_SRC = "/img/placeholders/ph-4x3-2.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

export function LeadSidebarBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm lg:col-span-2">
            <div className="flex flex-col items-start gap-4 p-8 lg:p-10">
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {f.feature59Heading}
              </h2>
              <p className="text-muted max-w-xl leading-relaxed">
                {f.feature59Paragraph}
              </p>
              <span className="text-fg mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                {f.feature59LinkLabel}
                <IconArrowRight size={16} aria-hidden="true" />
              </span>
            </div>
            <div className="border-border border-t">
              <Image
                src={IMAGE_SRC}
                alt={f.feature59ImageAlt}
                width={800}
                height={600}
                sizes={IMAGE_SIZES}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {SIDEBAR_CARDS.map((card) => (
              <div
                key={card.id}
                className="border-border bg-surface flex flex-1 flex-col gap-4 rounded-lg border p-5"
              >
                <span className="bg-brand/10 flex size-10 items-center justify-center rounded-md">
                  <card.icon size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-fg text-sm font-semibold">
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
      </div>
    </section>
  );
}
