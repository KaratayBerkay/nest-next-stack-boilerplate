"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const MASK_STYLE = {
  maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)",
} as const;

const CHECK_KEYS = [
  "feature125Check1",
  "feature125Check2",
  "feature125Check3",
  "feature125Check4",
] as const;

export function MaskedIllustrationChecklistFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <Image
              src="/img/placeholders/ph-1x1-3.webp"
              alt={f.feature125ImageAlt}
              width={640}
              height={640}
              style={MASK_STYLE}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature125Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature125Intro}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {CHECK_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span className="bg-success/10 text-success mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={14} aria-hidden="true" />
                  </span>
                  <span className="text-muted text-sm">{f[key]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
