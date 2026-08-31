"use client";

import Image from "next/image";
import { IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ROWS = [
  {
    titleKey: "feature62Row1Title",
    bodyKey: "feature62Row1Body",
    imageAltKey: "feature62Row1ImageAlt",
    imageClass: "lg:order-1",
    contentClass: "lg:order-2",
    checkKeys: [
      "feature62Row1Check1",
      "feature62Row1Check2",
      "feature62Row1Check3",
    ],
    src: "/img/placeholders/ph-4x3-0.webp",
  },
  {
    titleKey: "feature62Row2Title",
    bodyKey: "feature62Row2Body",
    imageAltKey: "feature62Row2ImageAlt",
    imageClass: "lg:order-2",
    contentClass: "lg:order-1",
    checkKeys: [
      "feature62Row2Check1",
      "feature62Row2Check2",
      "feature62Row2Check3",
    ],
    src: "/img/placeholders/ph-4x3-2.webp",
  },
  {
    titleKey: "feature62Row3Title",
    bodyKey: "feature62Row3Body",
    imageAltKey: "feature62Row3ImageAlt",
    imageClass: "lg:order-1",
    contentClass: "lg:order-2",
    checkKeys: [
      "feature62Row3Check1",
      "feature62Row3Check2",
      "feature62Row3Check3",
    ],
    src: "/img/placeholders/ph-4x3-4.webp",
  },
] as const;

export function AlternatingImageRowsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature62Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature62Intro}</p>
        </div>
        <div className="mt-14 flex flex-col gap-16 lg:gap-24">
          {ROWS.map((row) => (
            <div
              key={row.titleKey}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div
                className={`border-border bg-surface overflow-hidden rounded-lg border ${row.imageClass}`}
              >
                <Image
                  src={row.src}
                  alt={f[row.imageAltKey]}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div
                className={`flex flex-col items-start gap-4 ${row.contentClass}`}
              >
                <h3 className="text-fg text-2xl font-semibold tracking-tight">
                  {f[row.titleKey]}
                </h3>
                <p className="text-muted leading-relaxed">{f[row.bodyKey]}</p>
                <ul className="flex flex-col gap-2.5">
                  {row.checkKeys.map((checkKey) => (
                    <li key={checkKey} className="flex items-center gap-2.5">
                      <span className="bg-success/10 text-success flex size-5 shrink-0 items-center justify-center rounded-full">
                        <IconCheck size={12} aria-hidden="true" />
                      </span>
                      <span className="text-fg text-sm">{f[checkKey]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
