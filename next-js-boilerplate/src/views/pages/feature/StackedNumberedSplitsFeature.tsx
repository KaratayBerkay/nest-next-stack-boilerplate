"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const SPLITS = [
  {
    id: "discover",
    reverse: false,
    src: "/img/placeholders/ph-3x2-2.webp",
    numberKey: "feature14Split1Number",
    titleKey: "feature14Split1Title",
    bodyKey: "feature14Split1Body",
    altKey: "feature14Split1ImageAlt",
  },
  {
    id: "deploy",
    reverse: true,
    src: "/img/placeholders/ph-3x2-5.webp",
    numberKey: "feature14Split2Number",
    titleKey: "feature14Split2Title",
    bodyKey: "feature14Split2Body",
    altKey: "feature14Split2ImageAlt",
  },
] as const;

export function StackedNumberedSplitsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:px-8">
        {SPLITS.map((split) => (
          <div
            key={split.id}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
              split.reverse ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <Image
              src={split.src}
              alt={f[split.altKey]}
              width={640}
              height={427}
              className="border-border aspect-[3/2] w-full rounded-lg border object-cover"
            />
            <div className="flex flex-col items-start gap-3">
              <span className="text-brand text-sm font-semibold tabular-nums">
                {f[split.numberKey]}
              </span>
              <h3 className="text-fg text-2xl font-semibold tracking-tight">
                {f[split.titleKey]}
              </h3>
              <p className="text-muted leading-relaxed">{f[split.bodyKey]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
