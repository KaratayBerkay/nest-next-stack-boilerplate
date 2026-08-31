"use client";

import {
  IconAnchor,
  IconCloud,
  IconCompass,
  IconDroplet,
  IconFingerprint,
  IconLeaf,
  IconMoon,
  IconMountain,
  IconRadar,
  IconRocket,
  IconShieldCheck,
  IconSparkles,
  IconStack2,
  IconTarget,
  IconWaveSine,
  IconWind,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLogosMessages } from "@/types/pages/logos/LogosMessages-types";

interface BrandEntry {
  id: string;
  icon: Icon;
  nameKey: string;
}

interface CategoryEntry {
  id: string;
  labelKey: string;
  brands: BrandEntry[];
}

const CATEGORIES: CategoryEntry[] = [
  {
    id: "fintech",
    labelKey: "logos5CategoryFintechLabel",
    brands: [
      {
        id: "fintech-1",
        icon: IconShieldCheck,
        nameKey: "logos5FintechBrand1Name",
      },
      {
        id: "fintech-2",
        icon: IconFingerprint,
        nameKey: "logos5FintechBrand2Name",
      },
      { id: "fintech-3", icon: IconStack2, nameKey: "logos5FintechBrand3Name" },
      { id: "fintech-4", icon: IconTarget, nameKey: "logos5FintechBrand4Name" },
    ],
  },
  {
    id: "healthcare",
    labelKey: "logos5CategoryHealthcareLabel",
    brands: [
      {
        id: "healthcare-1",
        icon: IconWaveSine,
        nameKey: "logos5HealthcareBrand1Name",
      },
      {
        id: "healthcare-2",
        icon: IconLeaf,
        nameKey: "logos5HealthcareBrand2Name",
      },
      {
        id: "healthcare-3",
        icon: IconDroplet,
        nameKey: "logos5HealthcareBrand3Name",
      },
      {
        id: "healthcare-4",
        icon: IconMoon,
        nameKey: "logos5HealthcareBrand4Name",
      },
    ],
  },
  {
    id: "retail",
    labelKey: "logos5CategoryRetailLabel",
    brands: [
      { id: "retail-1", icon: IconCompass, nameKey: "logos5RetailBrand1Name" },
      { id: "retail-2", icon: IconSparkles, nameKey: "logos5RetailBrand2Name" },
      { id: "retail-3", icon: IconMountain, nameKey: "logos5RetailBrand3Name" },
      { id: "retail-4", icon: IconRocket, nameKey: "logos5RetailBrand4Name" },
    ],
  },
  {
    id: "logistics",
    labelKey: "logos5CategoryLogisticsLabel",
    brands: [
      {
        id: "logistics-1",
        icon: IconWind,
        nameKey: "logos5LogisticsBrand1Name",
      },
      {
        id: "logistics-2",
        icon: IconCloud,
        nameKey: "logos5LogisticsBrand2Name",
      },
      {
        id: "logistics-3",
        icon: IconAnchor,
        nameKey: "logos5LogisticsBrand3Name",
      },
      {
        id: "logistics-4",
        icon: IconRadar,
        nameKey: "logos5LogisticsBrand4Name",
      },
    ],
  },
];

export function IndustryTabsLogos() {
  const t = useMessages("pages") as unknown as PagesWithLogosMessages;
  const lg = t.logos;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {lg.logos5Eyebrow}
          </span>
          <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
            {lg.logos5Heading}
          </h2>
          <p className="text-muted text-sm leading-relaxed">{lg.logos5Intro}</p>
        </div>

        <Tabs defaultValue="fintech" className="mt-10">
          <div className="flex justify-center">
            <TabsList aria-label={lg.logos5TabsAria}>
              {CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {lg[category.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-8">
              <ul
                className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                aria-label={lg.logos5GridAriaTemplate.replace(
                  "{category}",
                  lg[category.labelKey],
                )}
              >
                {category.brands.map((brand) => (
                  <li
                    key={brand.id}
                    className="border-border bg-surface flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-8 text-center"
                  >
                    <brand.icon
                      size={24}
                      aria-hidden="true"
                      className="text-fg"
                    />
                    <span className="text-fg text-sm font-semibold tracking-tight">
                      {lg[brand.nameKey]}
                    </span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
