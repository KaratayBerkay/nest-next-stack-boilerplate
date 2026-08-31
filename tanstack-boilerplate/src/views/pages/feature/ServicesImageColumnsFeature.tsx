"use client";

import Image from "next/image";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const ROWS = [
  {
    titleKey: "feature157Row1Title",
    bodyKey: "feature157Row1Body",
    checkKeys: [
      "feature157Row1Check1",
      "feature157Row1Check2",
      "feature157Row1Check3",
    ],
    imageAltKey: "feature157Row1ImageAlt",
    src: "/img/placeholders/ph-4x3-4.webp",
    imageOrderClass: "",
  },
  {
    titleKey: "feature157Row2Title",
    bodyKey: "feature157Row2Body",
    checkKeys: [
      "feature157Row2Check1",
      "feature157Row2Check2",
      "feature157Row2Check3",
    ],
    imageAltKey: "feature157Row2ImageAlt",
    src: "/img/placeholders/ph-4x3-4.webp",
    imageOrderClass: "lg:order-2",
  },
] as const;

export function ServicesImageColumnsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature157Heading}
          </h2>
          <p className="text-muted">{f.feature157Intro}</p>
        </div>
        <div className="mt-12 flex flex-col gap-12 lg:gap-16">
          {ROWS.map((row) => (
            <div
              key={row.titleKey}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
            >
              <div
                className={`relative overflow-hidden rounded-lg ${row.imageOrderClass}`}
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
                className={`flex flex-col items-start gap-4 ${row.imageOrderClass === "" ? "" : "lg:order-1"}`}
              >
                <h3 className="text-fg text-xl font-semibold tracking-tight">
                  {f[row.titleKey]}
                </h3>
                <p className="text-muted leading-relaxed">{f[row.bodyKey]}</p>
                <ul className="flex flex-col gap-2.5">
                  {row.checkKeys.map((checkKey) => (
                    <li key={checkKey} className="flex items-start gap-2.5">
                      <span className="bg-success/10 text-success mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                        <IconCheck size={12} aria-hidden="true" />
                      </span>
                      <span className="text-muted text-sm">{f[checkKey]}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={LINK_URL}
                  className="text-fg group mt-2 inline-flex items-center gap-1.5 text-sm font-medium"
                >
                  {f.feature157LearnMore}
                  <IconArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
