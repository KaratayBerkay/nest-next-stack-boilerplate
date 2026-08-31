"use client";

import {
  IconCloud,
  IconCompass,
  IconDroplet,
  IconFingerprint,
  IconLeaf,
  IconPrism,
  IconSparkles,
  IconTarget,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLogosMessages } from "@/types/pages/logos/LogosMessages-types";

interface BrandEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  tagKey: string;
  sinceKey: string;
}

const BRANDS: BrandEntry[] = [
  {
    id: "brand-1",
    icon: IconCompass,
    nameKey: "logos7Brand1Name",
    tagKey: "logos7Brand1Tag",
    sinceKey: "logos7Brand1Since",
  },
  {
    id: "brand-2",
    icon: IconPrism,
    nameKey: "logos7Brand2Name",
    tagKey: "logos7Brand2Tag",
    sinceKey: "logos7Brand2Since",
  },
  {
    id: "brand-3",
    icon: IconFingerprint,
    nameKey: "logos7Brand3Name",
    tagKey: "logos7Brand3Tag",
    sinceKey: "logos7Brand3Since",
  },
  {
    id: "brand-4",
    icon: IconTarget,
    nameKey: "logos7Brand4Name",
    tagKey: "logos7Brand4Tag",
    sinceKey: "logos7Brand4Since",
  },
  {
    id: "brand-5",
    icon: IconLeaf,
    nameKey: "logos7Brand5Name",
    tagKey: "logos7Brand5Tag",
    sinceKey: "logos7Brand5Since",
  },
  {
    id: "brand-6",
    icon: IconDroplet,
    nameKey: "logos7Brand6Name",
    tagKey: "logos7Brand6Tag",
    sinceKey: "logos7Brand6Since",
  },
  {
    id: "brand-7",
    icon: IconCloud,
    nameKey: "logos7Brand7Name",
    tagKey: "logos7Brand7Tag",
    sinceKey: "logos7Brand7Since",
  },
  {
    id: "brand-8",
    icon: IconSparkles,
    nameKey: "logos7Brand8Name",
    tagKey: "logos7Brand8Tag",
    sinceKey: "logos7Brand8Since",
  },
];

export function BorderedSpotlightGridLogos() {
  const t = useMessages("pages") as unknown as PagesWithLogosMessages;
  const lg = t.logos;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {lg.logos7Eyebrow}
          </span>
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {lg.logos7Heading}
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            {lg.logos7Intro}
          </p>
        </div>
        <ul
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
          aria-label={lg.logos7GridAria}
        >
          {BRANDS.map((brand) => (
            <li key={brand.id}>
              <div className="border-border hover:border-brand hover:shadow-md flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-200">
                <brand.icon
                  size={26}
                  aria-hidden="true"
                  className="text-fg"
                />
                <span className="text-fg text-sm font-semibold tracking-tight">
                  {lg[brand.nameKey]}
                </span>
                <Badge variant="outline" size="sm">
                  {lg[brand.tagKey]}
                </Badge>
                <span className="text-muted text-xs">{lg[brand.sinceKey]}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
