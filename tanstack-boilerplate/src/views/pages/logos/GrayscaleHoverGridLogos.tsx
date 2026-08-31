"use client";

import {
  IconFingerprint,
  IconMoon,
  IconPuzzle,
  IconRadar,
  IconRocket,
  IconWind,
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
  { id: "brand-1", icon: IconWind, nameKey: "logos3Brand1Name" },
  { id: "brand-2", icon: IconFingerprint, nameKey: "logos3Brand2Name" },
  { id: "brand-3", icon: IconRadar, nameKey: "logos3Brand3Name" },
  { id: "brand-4", icon: IconPuzzle, nameKey: "logos3Brand4Name" },
  { id: "brand-5", icon: IconMoon, nameKey: "logos3Brand5Name" },
  { id: "brand-6", icon: IconRocket, nameKey: "logos3Brand6Name" },
];

export function GrayscaleHoverGridLogos() {
  const t = useMessages("pages") as unknown as PagesWithLogosMessages;
  const lg = t.logos;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {lg.logos3Eyebrow}
          </span>
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {lg.logos3Heading}
          </h2>
        </div>
        <ul
          className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3"
          aria-label={lg.logos3GridAria}
        >
          {BRANDS.map((brand) => (
            <li key={brand.id}>
              <div className="border-border group flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-10 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
                <brand.icon
                  size={30}
                  aria-hidden="true"
                  className="text-muted group-hover:text-brand transition-colors duration-300"
                />
                <span className="text-fg text-sm font-semibold tracking-tight">
                  {lg[brand.nameKey]}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-muted mt-8 text-center text-xs">
          {lg.logos3Hint}
        </p>
      </div>
    </section>
  );
}
