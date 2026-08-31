"use client";

import Image from "next/image";
import {
  IconBuildingBank,
  IconBuildingFactory2,
  IconCheck,
  IconChevronDown,
  IconSchool,
  IconShoppingBag,
  IconStethoscope,
  IconTruck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIndustriesMessages } from "@/types/pages/industries/IndustriesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface IndustryPanel {
  id: string;
  seed: string;
  icon: Icon;
  titleKey: string;
  metaKey: string;
  descriptionKey: string;
  checkKeys: string[];
  imageAltKey: string;
}

const INDUSTRIES: IndustryPanel[] = [
  {
    id: "healthcare",
    seed: "industries4-healthcare",
    icon: IconStethoscope,
    titleKey: "industries4Item1Title",
    metaKey: "industries4Item1Meta",
    descriptionKey: "industries4Item1Description",
    checkKeys: ["industries4Item1Check1", "industries4Item1Check2"],
    imageAltKey: "industries4Item1ImageAlt",
  },
  {
    id: "financial-services",
    seed: "industries4-financial",
    icon: IconBuildingBank,
    titleKey: "industries4Item2Title",
    metaKey: "industries4Item2Meta",
    descriptionKey: "industries4Item2Description",
    checkKeys: ["industries4Item2Check1", "industries4Item2Check2"],
    imageAltKey: "industries4Item2ImageAlt",
  },
  {
    id: "retail-ecommerce",
    seed: "industries4-retail",
    icon: IconShoppingBag,
    titleKey: "industries4Item3Title",
    metaKey: "industries4Item3Meta",
    descriptionKey: "industries4Item3Description",
    checkKeys: ["industries4Item3Check1", "industries4Item3Check2"],
    imageAltKey: "industries4Item3ImageAlt",
  },
  {
    id: "manufacturing",
    seed: "industries4-manufacturing",
    icon: IconBuildingFactory2,
    titleKey: "industries4Item4Title",
    metaKey: "industries4Item4Meta",
    descriptionKey: "industries4Item4Description",
    checkKeys: ["industries4Item4Check1", "industries4Item4Check2"],
    imageAltKey: "industries4Item4ImageAlt",
  },
  {
    id: "logistics",
    seed: "industries4-logistics",
    icon: IconTruck,
    titleKey: "industries4Item5Title",
    metaKey: "industries4Item5Meta",
    descriptionKey: "industries4Item5Description",
    checkKeys: ["industries4Item5Check1", "industries4Item5Check2"],
    imageAltKey: "industries4Item5ImageAlt",
  },
  {
    id: "education",
    seed: "industries4-education",
    icon: IconSchool,
    titleKey: "industries4Item6Title",
    metaKey: "industries4Item6Meta",
    descriptionKey: "industries4Item6Description",
    checkKeys: ["industries4Item6Check1", "industries4Item6Check2"],
    imageAltKey: "industries4Item6ImageAlt",
  },
];

export function ExpandableIndustryShowcase() {
  const t = useMessages("pages") as unknown as PagesWithIndustriesMessages;
  const i = t.industries;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {i.industries4Heading}
          </h2>
          <p className="text-muted max-w-xl">{i.industries4Intro}</p>
        </div>
        <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-xs">
          <Accordion type="single" collapsible defaultValue="healthcare">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <AccordionItem key={industry.id} value={industry.id}>
                  <AccordionTrigger className="group gap-4">
                    <span className="flex items-center gap-3">
                      <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon size={18} />
                      </span>
                      <span className="text-fg text-left font-semibold">
                        {i[industry.titleKey]}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-muted hidden text-xs sm:inline">
                        {i[industry.metaKey]}
                      </span>
                      <IconChevronDown
                        size={18}
                        aria-hidden="true"
                        className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-6 sm:grid-cols-2 sm:items-start">
                      <div className="flex flex-col gap-4">
                        <p className="text-muted text-sm leading-relaxed">
                          {i[industry.descriptionKey]}
                        </p>
                        <ul className="flex flex-col gap-2.5">
                          {industry.checkKeys.map((checkKey) => (
                            <li
                              key={checkKey}
                              className="flex items-start gap-2.5"
                            >
                              <IconCheck
                                size={16}
                                className="text-brand mt-0.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-muted text-sm">
                                {i[checkKey]}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-border relative aspect-[4/3] overflow-hidden rounded-xl border">
                        <Image
                          src={placeholderImage(industry.seed, "4x3")}
                          alt={i[industry.imageAltKey]}
                          fill
                          sizes="(min-width: 640px) 30vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
