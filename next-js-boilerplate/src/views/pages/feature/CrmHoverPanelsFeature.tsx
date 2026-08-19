"use client";

import Image from "next/image";
import { IconArrowUpRight, IconCheck } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const PANELS = [
  {
    titleKey: "feature150Panel1Title",
    bodyKey: "feature150Panel1Body",
    imageAltKey: "feature150Panel1ImageAlt",
    checkKeys: [
      "feature150Panel1Check1",
      "feature150Panel1Check2",
      "feature150Panel1Check3",
    ],
    src: "https://picsum.photos/seed/feature150-1/800/600",
  },
  {
    titleKey: "feature150Panel2Title",
    bodyKey: "feature150Panel2Body",
    imageAltKey: "feature150Panel2ImageAlt",
    checkKeys: [
      "feature150Panel2Check1",
      "feature150Panel2Check2",
      "feature150Panel2Check3",
    ],
    src: "https://picsum.photos/seed/feature150-2/800/600",
  },
] as const;

export function CrmHoverPanelsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature150Heading}
          </h2>
          <p className="text-muted">{f.feature150Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PANELS.map((panel) => (
            <article
              key={panel.titleKey}
              className="border-border bg-surface group overflow-hidden rounded-lg border"
            >
              <div className="flex flex-col gap-4 p-6">
                <h3 className="text-fg text-lg font-semibold">
                  {f[panel.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[panel.bodyKey]}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {panel.checkKeys.map((checkKey) => (
                    <li key={checkKey} className="flex items-start gap-2.5">
                      <IconCheck size={18} className="mt-0.5 shrink-0" />
                      <span className="text-muted text-sm">{f[checkKey]}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={LINK_URL}
                  className="text-fg mt-auto inline-flex items-center gap-1.5 text-sm font-medium"
                >
                  {f.feature150LearnMore}
                  <IconArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src={panel.src}
                  alt={f[panel.imageAltKey]}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
