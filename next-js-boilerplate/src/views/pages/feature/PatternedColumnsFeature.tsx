"use client";

import Image from "next/image";
import {
  IconCalendar,
  IconFileText,
  IconLayoutKanban,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const COLUMNS = [
  {
    titleKey: "feature219Col1Title",
    bodyKey: "feature219Col1Body",
    imageAltKey: "feature219Col1ImageAlt",
    Icon: IconLayoutKanban,
    src: "https://picsum.photos/seed/feature219-1/800/600",
    frameClass: "-top-3 -left-3",
    imageClass: "rotate-1",
    paddingClass: "lg:pr-8",
  },
  {
    titleKey: "feature219Col2Title",
    bodyKey: "feature219Col2Body",
    imageAltKey: "feature219Col2ImageAlt",
    Icon: IconCalendar,
    src: "https://picsum.photos/seed/feature219-2/800/600",
    frameClass: "-top-3 -right-3",
    imageClass: "-rotate-1",
    paddingClass: "lg:px-8",
  },
  {
    titleKey: "feature219Col3Title",
    bodyKey: "feature219Col3Body",
    imageAltKey: "feature219Col3ImageAlt",
    Icon: IconFileText,
    src: "https://picsum.photos/seed/feature219-3/800/600",
    frameClass: "-right-3 -bottom-3",
    imageClass: "rotate-2",
    paddingClass: "lg:pl-8",
  },
] as const;

export function PatternedColumnsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-sm font-semibold tracking-widest uppercase">
            {f.feature219Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature219Heading}
          </h2>
          <p className="text-muted">{f.feature219Intro}</p>
        </div>
        <div className="lg:divide-border mt-12 grid gap-12 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-dashed">
          {COLUMNS.map((column) => (
            <article
              key={column.titleKey}
              className={`flex flex-col gap-6 ${column.paddingClass}`}
            >
              <div className="relative">
                <span
                  className={`border-border absolute size-20 rounded-lg border-2 border-dashed ${column.frameClass}`}
                  aria-hidden="true"
                />
                <Image
                  src={column.src}
                  alt={f[column.imageAltKey]}
                  width={800}
                  height={600}
                  className={`border-border relative aspect-[4/3] w-full rounded-lg border object-cover ${column.imageClass}`}
                />
              </div>
              <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-md">
                <column.Icon size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-fg text-lg font-semibold">
                  {f[column.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[column.bodyKey]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
