"use client";

import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface FeaturePanel {
  id: string;
  titleKey: string;
  bodyKey: string;
  linkKey: string;
  altKey: string;
  src: string;
}

const PANELS: FeaturePanel[] = [
  {
    id: "plan",
    titleKey: "feature74Panel1Title",
    bodyKey: "feature74Panel1Body",
    linkKey: "feature74Panel1Link",
    altKey: "feature74Panel1ImageAlt",
    src: "/img/placeholders/ph-4x3-0.webp",
  },
  {
    id: "automate",
    titleKey: "feature74Panel2Title",
    bodyKey: "feature74Panel2Body",
    linkKey: "feature74Panel2Link",
    altKey: "feature74Panel2ImageAlt",
    src: "/img/placeholders/ph-4x3-2.webp",
  },
];

export function TwoLargePanelsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature74Heading}
          </h2>
          <p className="text-muted leading-relaxed">{f.feature74Intro}</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PANELS.map((panel) => (
            <div
              key={panel.id}
              className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm"
            >
              <div className="overflow-hidden">
                <Image
                  src={panel.src}
                  alt={f[panel.altKey]}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="flex flex-col items-start gap-2.5 p-6">
                <h3 className="text-fg text-xl font-semibold">
                  {f[panel.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[panel.bodyKey]}
                </p>
                <span className="text-fg mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                  {f[panel.linkKey]}
                  <IconArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
