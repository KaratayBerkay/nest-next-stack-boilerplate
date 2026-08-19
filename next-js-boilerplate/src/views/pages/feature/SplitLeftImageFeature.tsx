"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const IMAGE_SRC = "https://picsum.photos/seed/feature344-main/640/640" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

const CHECK_KEYS = [
  { titleKey: "feature344Check1" },
  { titleKey: "feature344Check2" },
  { titleKey: "feature344Check3" },
  { titleKey: "feature344Check4" },
] as const;

export function SplitLeftImageFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="border-border bg-surface relative overflow-hidden rounded-lg border">
            <Image
              src={IMAGE_SRC}
              alt={f.feature344ImageAlt}
              width={640}
              height={640}
              sizes={IMAGE_SIZES}
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="from-surface pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent"
            />
            <div
              aria-hidden="true"
              className="from-surface pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent"
            />
          </div>
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature344Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature344Blurb}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {CHECK_KEYS.map((check) => (
                <li key={check.titleKey} className="flex items-start gap-2.5">
                  <span className="bg-success/10 text-success mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={14} aria-hidden="true" />
                  </span>
                  <span className="text-muted text-sm">
                    {f[check.titleKey]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
