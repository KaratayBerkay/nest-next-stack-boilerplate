"use client";

import {
  IconAtom,
  IconCompass,
  IconDroplet,
  IconFlame,
  IconHexagon,
  IconLeaf,
  IconPrism,
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

const BRANDS: BrandEntry[] = [
  { id: "brand-1", icon: IconCompass, nameKey: "logos1Brand1Name" },
  { id: "brand-2", icon: IconPrism, nameKey: "logos1Brand2Name" },
  { id: "brand-3", icon: IconWaveSine, nameKey: "logos1Brand3Name" },
  { id: "brand-4", icon: IconAtom, nameKey: "logos1Brand4Name" },
  { id: "brand-5", icon: IconHexagon, nameKey: "logos1Brand5Name" },
  { id: "brand-6", icon: IconDroplet, nameKey: "logos1Brand6Name" },
  { id: "brand-7", icon: IconLeaf, nameKey: "logos1Brand7Name" },
  { id: "brand-8", icon: IconFlame, nameKey: "logos1Brand8Name" },
];

export function TrustedByGridLogos() {
  const t = useMessages("pages") as unknown as PagesWithLogosMessages;
  const lg = t.logos;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {lg.logos1Eyebrow}
          </span>
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {lg.logos1Heading}
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            {lg.logos1Intro}
          </p>
        </div>
        <ul
          className="border-border bg-border mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4"
          aria-label={lg.logos1GridAria}
        >
          {BRANDS.map((brand) => (
            <li
              key={brand.id}
              className="bg-bg flex items-center justify-center gap-2 px-6 py-8"
            >
              <brand.icon
                size={20}
                aria-hidden="true"
                className="text-muted shrink-0"
              />
              <span className="text-fg text-sm font-semibold tracking-tight">
                {lg[brand.nameKey]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
