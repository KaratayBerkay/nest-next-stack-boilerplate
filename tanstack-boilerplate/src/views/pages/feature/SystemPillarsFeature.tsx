"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const PILLARS = [
  { titleKey: "feature299Pillar1Title", bodyKey: "feature299Pillar1Body" },
  { titleKey: "feature299Pillar2Title", bodyKey: "feature299Pillar2Body" },
  { titleKey: "feature299Pillar3Title", bodyKey: "feature299Pillar3Body" },
] as const;

const BROWSER_SRC = "/img/placeholders/ph-4x3-5.webp" as const;

export function SystemPillarsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature299Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature299Intro}</p>
        </div>
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <ul className="flex flex-col">
            {PILLARS.map((pillar, index) => (
              <li
                key={pillar.titleKey}
                className="border-border flex items-start gap-6 border-b py-6 first:border-t"
              >
                <span className="text-muted pt-1 text-sm font-medium tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-1 flex-col gap-1.5">
                  <h3 className="text-fg text-lg font-semibold">
                    {f[pillar.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[pillar.bodyKey]}
                  </p>
                </div>
                <IconArrowRight
                  size={18}
                  className="text-muted mt-1.5 shrink-0"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
          <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-md lg:sticky lg:top-24">
            <div className="border-border flex items-center gap-1.5 border-b px-4 py-3">
              <span
                className="bg-bg size-2.5 rounded-full"
                aria-hidden="true"
              />
              <span
                className="bg-bg size-2.5 rounded-full"
                aria-hidden="true"
              />
              <span
                className="bg-bg size-2.5 rounded-full"
                aria-hidden="true"
              />
            </div>
            <Image
              src={BROWSER_SRC}
              alt={f.feature299BrowserImageAlt}
              width={800}
              height={600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
