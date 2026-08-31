"use client";

import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    id: "design",
    src: "/img/placeholders/ph-3x2-0.webp",
    titleKey: "feature73Card1Title",
    altKey: "feature73Card1ImageAlt",
  },
  {
    id: "engineering",
    src: "/img/placeholders/ph-3x2-3.webp",
    titleKey: "feature73Card2Title",
    altKey: "feature73Card2ImageAlt",
  },
  {
    id: "growth",
    src: "/img/placeholders/ph-3x2-6.webp",
    titleKey: "feature73Card3Title",
    altKey: "feature73Card3ImageAlt",
  },
] as const;

export function HeaderLinkImageGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature73Heading}
            </h2>
            <p className="text-muted">{f.feature73Intro}</p>
          </div>
          <Link
            href="#"
            className="text-brand inline-flex shrink-0 items-center gap-1.5 text-sm font-medium hover:underline"
          >
            {f.feature73HeaderLink}
            <IconArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="border-border bg-surface relative overflow-hidden rounded-xl border"
            >
              <Image
                src={card.src}
                alt={f[card.altKey]}
                width={640}
                height={427}
                className="aspect-[3/2] w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              />
              <h3 className="absolute inset-x-0 bottom-0 p-4 text-base font-semibold text-white">
                {f[card.titleKey]}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
