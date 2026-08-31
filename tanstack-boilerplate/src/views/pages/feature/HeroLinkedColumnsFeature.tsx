"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const HERO_IMAGE = "/img/placeholders/ph-16x9-5.webp" as const;
const COLUMN_CLASS =
  "border-border bg-surface flex flex-col gap-3 rounded-lg border p-6" as const;
const LINK_CLASS =
  "text-fg group mt-auto inline-flex items-center gap-1.5 text-sm font-medium" as const;

const COLUMNS = [
  {
    titleKey: "feature33Col1Title",
    bodyKey: "feature33Col1Body",
    linkKey: "feature33Col1Link",
  },
  {
    titleKey: "feature33Col2Title",
    bodyKey: "feature33Col2Body",
    linkKey: "feature33Col2Link",
  },
  {
    titleKey: "feature33Col3Title",
    bodyKey: "feature33Col3Body",
    linkKey: "feature33Col3Link",
  },
] as const;

export function HeroLinkedColumnsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature33Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed lg:text-lg">
            {f.feature33Subtitle}
          </p>
        </div>
        <div className="border-border bg-surface relative mt-12 aspect-video overflow-hidden rounded-lg border">
          <Image
            src={HERO_IMAGE}
            alt={f.feature33ImageAlt}
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.titleKey} className={COLUMN_CLASS}>
              <h3 className="text-fg text-lg font-semibold">
                {f[column.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[column.bodyKey]}
              </p>
              <a href={LINK_URL} className={LINK_CLASS}>
                {f[column.linkKey]}
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
