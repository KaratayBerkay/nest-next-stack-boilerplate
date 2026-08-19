"use client";

import Image from "next/image";
import {
  IconArrowUpRight,
  IconChartBar,
  IconInbox,
  IconPlug,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 33vw";

const COLUMNS = [
  {
    titleKey: "feature130Col1Title",
    bodyKey: "feature130Col1Body",
    imageAltKey: "feature130Col1ImageAlt",
    imageSrc: "https://picsum.photos/seed/feature130-col1/800/533",
    Icon: IconInbox,
  },
  {
    titleKey: "feature130Col2Title",
    bodyKey: "feature130Col2Body",
    imageAltKey: "feature130Col2ImageAlt",
    imageSrc: "https://picsum.photos/seed/feature130-col2/800/533",
    Icon: IconPlug,
  },
  {
    titleKey: "feature130Col3Title",
    bodyKey: "feature130Col3Body",
    imageAltKey: "feature130Col3ImageAlt",
    imageSrc: "https://picsum.photos/seed/feature130-col3/800/533",
    Icon: IconChartBar,
  },
] as const;

export function IntegrationNarrativeFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature130Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature130Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <article
              key={column.titleKey}
              className="border-border bg-surface relative flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative aspect-[3/2] shrink-0">
                <Image
                  src={column.imageSrc}
                  alt={f[column.imageAltKey]}
                  fill
                  sizes={IMAGE_SIZES}
                  className="object-cover"
                />
              </div>
              <div className="relative flex flex-1 flex-col gap-2.5 p-6 pt-12">
                <span className="bg-brand text-brand-fg absolute top-0 left-6 flex size-11 -translate-y-1/2 items-center justify-center rounded-md shadow-xs">
                  <column.Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="text-fg text-lg font-semibold">
                  {f[column.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[column.bodyKey]}
                </p>
                <a
                  href={LINK_URL}
                  className="text-fg group mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium"
                >
                  {f.feature130LearnMore}
                  <IconArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
