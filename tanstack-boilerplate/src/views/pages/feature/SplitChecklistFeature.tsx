"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const IMAGE_SRC = "/img/placeholders/ph-1x1-6.webp" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

const CHECK_KEYS = [
  "feature6Check1",
  "feature6Check2",
  "feature6Check3",
  "feature6Check4",
] as const;

export function SplitChecklistFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature6Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature6Blurb}</p>
            <ul className="flex flex-col gap-3">
              {CHECK_KEYS.map((checkKey) => (
                <li key={checkKey} className="flex items-start gap-2.5">
                  <IconCheck size={18} className="mt-0.5 shrink-0" />
                  <span className="text-muted text-sm">{f[checkKey]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-lg border">
            <Image
              src={IMAGE_SRC}
              alt={f.feature6ImageAlt}
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
