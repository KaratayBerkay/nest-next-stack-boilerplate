"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const SPOTLIGHT_IMAGE =
  "https://picsum.photos/seed/feature139/1200/675" as const;

const DETAILS = [
  { titleKey: "feature139Detail1Title", bodyKey: "feature139Detail1Body" },
  { titleKey: "feature139Detail2Title", bodyKey: "feature139Detail2Body" },
  { titleKey: "feature139Detail3Title", bodyKey: "feature139Detail3Body" },
  { titleKey: "feature139Detail4Title", bodyKey: "feature139Detail4Body" },
] as const;

export function SpotlightDetailsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge>{f.feature139Badge}</Badge>
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature139Heading}
            </h2>
            <p className="text-muted">{f.feature139Paragraph}</p>
          </div>
        </div>
        <div className="border-border bg-surface mt-12 overflow-hidden rounded-lg border">
          <div className="bg-bg aspect-video overflow-hidden">
            <Image
              src={SPOTLIGHT_IMAGE}
              alt={f.feature139ImageAlt}
              width={1200}
              height={675}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-muted border-border border-t px-6 py-4 text-sm">
            {f.feature139ImageAlt}
          </p>
          <div className="border-border grid gap-10 border-t px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:px-10">
            {DETAILS.map((detail, index) => (
              <div
                key={detail.titleKey}
                className={`flex flex-col gap-2 ${index > 0 ? "border-border lg:border-l lg:pl-8" : ""}`}
              >
                <h3 className="text-fg text-base font-semibold">
                  {f[detail.titleKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f[detail.bodyKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
