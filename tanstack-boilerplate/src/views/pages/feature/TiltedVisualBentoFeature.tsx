"use client";

import Image from "next/image";
import {
  IconBolt,
  IconChartBar,
  IconShieldCheck,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const FEATURES = [
  {
    titleKey: "feature269Feature1Title",
    bodyKey: "feature269Feature1Body",
    Icon: IconBolt,
  },
  {
    titleKey: "feature269Feature2Title",
    bodyKey: "feature269Feature2Body",
    Icon: IconUsersGroup,
  },
  {
    titleKey: "feature269Feature3Title",
    bodyKey: "feature269Feature3Body",
    Icon: IconChartBar,
  },
  {
    titleKey: "feature269Feature4Title",
    bodyKey: "feature269Feature4Body",
    Icon: IconShieldCheck,
  },
] as const;

export function TiltedVisualBentoFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="border-border h-px w-10 border-t" />
                <span className="text-muted text-xs font-medium tracking-widest uppercase">
                  {f.feature269FeaturesLabel}
                </span>
              </div>
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {f.feature269Heading}
              </h2>
              <p className="text-muted leading-relaxed">{f.feature269Intro}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-5"
                >
                  <span className="border-border bg-bg text-fg inline-flex size-9 items-center justify-center rounded-md border">
                    <feature.Icon size={18} aria-hidden="true" />
                  </span>
                  <h3 className="text-fg text-sm font-semibold">
                    {f[feature.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {f[feature.bodyKey]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative pb-10 lg:pl-10">
            <div className="border-border bg-surface rotate-2 rounded-xl border p-3 shadow-lg">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src="/img/placeholders/ph-4x3-5.webp"
                  alt={f.feature269ImageAlt}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
            <div className="border-border bg-surface absolute -bottom-0 -left-0 max-w-56 -rotate-2 rounded-xl border p-5 shadow-md">
              <span className="text-success text-xs font-semibold tracking-widest uppercase">
                {f.feature269CardTag}
              </span>
              <p className="text-fg mt-1 text-2xl font-semibold tracking-tight">
                {f.feature269CardTitle}
              </p>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {f.feature269CardBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
