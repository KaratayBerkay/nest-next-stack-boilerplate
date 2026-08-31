"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ROWS = [
  {
    id: "row1",
    reverse: false,
    titleKey: "feature31Row1Title",
    bodyKey: "feature31Row1Body",
    altKey: "feature31Row1ImageAlt",
    src: "/img/placeholders/ph-3x2-1.webp",
  },
  {
    id: "row2",
    reverse: true,
    titleKey: "feature31Row2Title",
    bodyKey: "feature31Row2Body",
    altKey: "feature31Row2ImageAlt",
    src: "/img/placeholders/ph-3x2-4.webp",
  },
] as const;

export function AlternatingIntroPairsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {f.feature31Heading}
        </h2>
        <p className="text-muted mx-auto mt-4 max-w-xl">{f.feature31Intro}</p>
      </div>
      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-16 px-6 lg:px-8">
        {ROWS.map((row) => (
          <div
            key={row.id}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${row.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            <Image
              src={row.src}
              alt={f[row.altKey]}
              width={640}
              height={427}
              className="border-border aspect-[3/2] w-full rounded-lg border object-cover"
            />
            <div className="flex flex-col items-start gap-3">
              <h3 className="text-fg text-2xl font-semibold tracking-tight">
                {f[row.titleKey]}
              </h3>
              <p className="text-muted leading-relaxed">{f[row.bodyKey]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
