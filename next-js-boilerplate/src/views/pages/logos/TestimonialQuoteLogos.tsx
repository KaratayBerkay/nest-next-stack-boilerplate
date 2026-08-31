"use client";

import {
  IconFlame,
  IconHexagon,
  IconMountain,
  IconPrism,
  IconPuzzle,
  IconRocket,
  IconWaveSine,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLogosMessages } from "@/types/pages/logos/LogosMessages-types";

interface BrandEntry {
  id: string;
  icon: Icon;
  nameKey: string;
}

const OTHER_BRANDS: BrandEntry[] = [
  { id: "brand-1", icon: IconPuzzle, nameKey: "logos6Brand1Name" },
  { id: "brand-2", icon: IconRocket, nameKey: "logos6Brand2Name" },
  { id: "brand-3", icon: IconWaveSine, nameKey: "logos6Brand3Name" },
  { id: "brand-4", icon: IconHexagon, nameKey: "logos6Brand4Name" },
  { id: "brand-5", icon: IconFlame, nameKey: "logos6Brand5Name" },
  { id: "brand-6", icon: IconMountain, nameKey: "logos6Brand6Name" },
];

export function TestimonialQuoteLogos() {
  const t = useMessages("pages") as unknown as PagesWithLogosMessages;
  const lg = t.logos;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="border-border bg-surface rounded-2xl border p-8 lg:p-12">
          <div className="flex items-center gap-2.5">
            <IconPrism size={22} aria-hidden="true" className="text-brand" />
            <span className="text-fg text-sm font-semibold tracking-tight">
              {lg.logos6FeaturedBrandName}
            </span>
          </div>
          <blockquote className="text-fg mt-6 text-xl leading-relaxed font-medium lg:text-2xl">
            {`“${lg.logos6QuoteText}”`}
          </blockquote>
          <div className="mt-6">
            <p className="text-fg text-sm font-semibold">
              {lg.logos6QuoteAuthorName}
            </p>
            <p className="text-muted text-sm">
              {lg.logos6QuoteAuthorRoleTemplate
                .replace("{role}", lg.logos6QuoteAuthorRole)
                .replace("{company}", lg.logos6FeaturedBrandName)}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <p className="text-muted text-xs font-semibold tracking-wider uppercase">
            {lg.logos6AlsoTrustedLabel}
          </p>
          <ul
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
            aria-label={lg.logos6AlsoTrustedLabel}
          >
            {OTHER_BRANDS.map((brand) => (
              <li key={brand.id} className="flex items-center gap-2">
                <brand.icon
                  size={18}
                  aria-hidden="true"
                  className="text-muted shrink-0"
                />
                <span className="text-muted text-sm font-semibold tracking-tight">
                  {lg[brand.nameKey]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
