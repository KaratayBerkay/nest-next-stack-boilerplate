"use client";

import Link from "next/link";
import {
  IconArrowUpRight,
  IconBuildingBank,
  IconBuildingFactory2,
  IconSchool,
  IconShoppingBag,
  IconStethoscope,
  IconTruck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIndustriesMessages } from "@/types/pages/industries/IndustriesMessages-types";

const LINK_URL = "#" as const;

interface IndustryCard {
  id: string;
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
}

const INDUSTRIES: IndustryCard[] = [
  {
    id: "healthcare",
    icon: IconStethoscope,
    titleKey: "industries1Item1Title",
    descriptionKey: "industries1Item1Description",
  },
  {
    id: "financial-services",
    icon: IconBuildingBank,
    titleKey: "industries1Item2Title",
    descriptionKey: "industries1Item2Description",
  },
  {
    id: "retail-ecommerce",
    icon: IconShoppingBag,
    titleKey: "industries1Item3Title",
    descriptionKey: "industries1Item3Description",
  },
  {
    id: "manufacturing",
    icon: IconBuildingFactory2,
    titleKey: "industries1Item4Title",
    descriptionKey: "industries1Item4Description",
  },
  {
    id: "logistics",
    icon: IconTruck,
    titleKey: "industries1Item5Title",
    descriptionKey: "industries1Item5Description",
  },
  {
    id: "education",
    icon: IconSchool,
    titleKey: "industries1Item6Title",
    descriptionKey: "industries1Item6Description",
  },
];

export function HoverRevealIndustryCards() {
  const t = useMessages("pages") as unknown as PagesWithIndustriesMessages;
  const i = t.industries;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {i.industries1Heading}
          </h2>
          <p className="text-muted">{i.industries1Intro}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            return (
              <Card key={industry.id} variant="interactive" className="group">
                <Link
                  href={LINK_URL}
                  className="focus-visible:ring-brand flex flex-col rounded-xl p-6 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-2xl">
                      <Icon size={22} />
                    </span>
                    <IconArrowUpRight
                      size={18}
                      aria-hidden="true"
                      className="text-muted group-hover:text-brand group-focus-within:text-brand transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5"
                    />
                  </div>
                  <h3 className="text-fg mt-5 text-lg font-semibold">
                    {i[industry.titleKey]}
                  </h3>
                  <div className="group-hover:mt-3 group-focus-within:mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:max-h-28 group-hover:opacity-100 group-focus-within:max-h-28 group-focus-within:opacity-100">
                    <p className="text-muted text-sm leading-relaxed">
                      {i[industry.descriptionKey]}
                    </p>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
