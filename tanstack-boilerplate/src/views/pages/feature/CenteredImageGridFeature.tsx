"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CARDS = [
  {
    titleKey: "feature115Card1Title",
    labelKey: "feature115Card1Label",
    altKey: "feature115Card1ImageAlt",
    src: "/img/placeholders/ph-1x1-4.webp",
  },
  {
    titleKey: "feature115Card2Title",
    labelKey: "feature115Card2Label",
    altKey: "feature115Card2ImageAlt",
    src: "/img/placeholders/ph-1x1-1.webp",
  },
  {
    titleKey: "feature115Card3Title",
    labelKey: "feature115Card3Label",
    altKey: "feature115Card3ImageAlt",
    src: "/img/placeholders/ph-1x1-2.webp",
  },
  {
    titleKey: "feature115Card4Title",
    labelKey: "feature115Card4Label",
    altKey: "feature115Card4ImageAlt",
    src: "/img/placeholders/ph-1x1-4.webp",
  },
  {
    titleKey: "feature115Card5Title",
    labelKey: "feature115Card5Label",
    altKey: "feature115Card5ImageAlt",
    src: "/img/placeholders/ph-1x1-2.webp",
  },
  {
    titleKey: "feature115Card6Title",
    labelKey: "feature115Card6Label",
    altKey: "feature115Card6ImageAlt",
    src: "/img/placeholders/ph-1x1-0.webp",
  },
] as const;

export function CenteredImageGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge>{f.feature115Badge}</Badge>
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature115Heading}
            </h2>
            <p className="text-muted">{f.feature115Paragraph}</p>
          </div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.titleKey}
              className="border-border bg-surface overflow-hidden rounded-lg border"
            >
              <div className="bg-bg aspect-square overflow-hidden">
                <Image
                  src={card.src}
                  alt={f[card.altKey]}
                  width={480}
                  height={480}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start gap-3 p-6">
                <h3 className="text-fg text-lg font-semibold">
                  {f[card.titleKey]}
                </h3>
                <span className="border-border text-muted inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">
                  {f[card.labelKey]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
