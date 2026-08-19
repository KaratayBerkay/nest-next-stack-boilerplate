"use client";

import Image from "next/image";
import {
  IconChartBar,
  IconGitBranch,
  IconInbox,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const IMAGE_SRC =
  "https://picsum.photos/seed/feature271-main/1000/1250" as const;
const IMAGE_SIZES = "(max-width: 1024px) 100vw, 50vw";

const ITEMS = [
  {
    titleKey: "feature271Item1Title",
    bodyKey: "feature271Item1Body",
    Icon: IconInbox,
  },
  {
    titleKey: "feature271Item2Title",
    bodyKey: "feature271Item2Body",
    Icon: IconChartBar,
  },
  {
    titleKey: "feature271Item3Title",
    bodyKey: "feature271Item3Body",
    Icon: IconGitBranch,
  },
  {
    titleKey: "feature271Item4Title",
    bodyKey: "feature271Item4Body",
    Icon: IconShieldCheck,
  },
] as const;

export function AuroraFeatureListFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-brand/20 absolute -top-24 left-1/4 size-96 rounded-full blur-3xl" />
        <div className="bg-brand/20 absolute top-1/3 -right-24 size-80 rounded-full blur-3xl" />
        <div className="bg-brand/20 absolute -bottom-32 left-1/2 size-72 rounded-full blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
                {f.feature271Heading}
              </h2>
              <p className="text-muted leading-relaxed">
                {f.feature271Paragraph}
              </p>
            </div>
            <ul className="divide-border w-full divide-y">
              {ITEMS.map((item) => (
                <li key={item.titleKey} className="flex items-start gap-4 py-5">
                  <span className="bg-brand text-brand-fg flex size-11 shrink-0 items-center justify-center rounded-md">
                    <item.Icon size={22} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-fg text-base font-semibold">
                      {f[item.titleKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {f[item.bodyKey]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border bg-surface relative aspect-[4/5] overflow-hidden rounded-[2rem] border sm:aspect-[3/4] lg:aspect-auto lg:h-full">
            <Image
              src={IMAGE_SRC}
              alt={f.feature271ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
