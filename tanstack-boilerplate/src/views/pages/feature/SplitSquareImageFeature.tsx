"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;
const IMAGE_SRC = "/img/placeholders/ph-1x1-0.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

export function SplitSquareImageFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature1Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature1Blurb}</p>
            <Button asChild variant="outline">
              <a href={LINK_URL}>{f.feature1ButtonLabel}</a>
            </Button>
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-lg border">
            <Image
              src={IMAGE_SRC}
              alt={f.feature1ImageAlt}
              width={640}
              height={640}
              sizes={IMAGE_SIZES}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
