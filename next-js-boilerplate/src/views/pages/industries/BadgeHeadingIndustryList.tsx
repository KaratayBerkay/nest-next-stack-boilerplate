"use client";

import {
  IconBuildingBank,
  IconBuildingFactory2,
  IconSchool,
  IconShoppingBag,
  IconStethoscope,
  IconTruck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIndustriesMessages } from "@/types/pages/industries/IndustriesMessages-types";

interface IndustryRow {
  id: string;
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
  tagKey: string;
}

const INDUSTRIES: IndustryRow[] = [
  {
    id: "healthcare",
    icon: IconStethoscope,
    titleKey: "industries2Item1Title",
    descriptionKey: "industries2Item1Description",
    tagKey: "industries2Item1Tag",
  },
  {
    id: "financial-services",
    icon: IconBuildingBank,
    titleKey: "industries2Item2Title",
    descriptionKey: "industries2Item2Description",
    tagKey: "industries2Item2Tag",
  },
  {
    id: "retail-ecommerce",
    icon: IconShoppingBag,
    titleKey: "industries2Item3Title",
    descriptionKey: "industries2Item3Description",
    tagKey: "industries2Item3Tag",
  },
  {
    id: "manufacturing",
    icon: IconBuildingFactory2,
    titleKey: "industries2Item4Title",
    descriptionKey: "industries2Item4Description",
    tagKey: "industries2Item4Tag",
  },
  {
    id: "logistics",
    icon: IconTruck,
    titleKey: "industries2Item5Title",
    descriptionKey: "industries2Item5Description",
    tagKey: "industries2Item5Tag",
  },
  {
    id: "education",
    icon: IconSchool,
    titleKey: "industries2Item6Title",
    descriptionKey: "industries2Item6Description",
    tagKey: "industries2Item6Tag",
  },
];

export function BadgeHeadingIndustryList() {
  const t = useMessages("pages") as unknown as PagesWithIndustriesMessages;
  const i = t.industries;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <Badge variant="soft" pill size="sm">
            {i.industries2Eyebrow}
          </Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {i.industries2Heading}
          </h2>
          <p className="text-muted max-w-xl">{i.industries2Intro}</p>
        </div>
        <div className="border-border divide-border divide-y border-t border-b">
          {INDUSTRIES.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.id}
                className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="text-muted w-6 shrink-0 pt-2 font-mono text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon size={20} />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-fg font-semibold">
                      {i[industry.titleKey]}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {i[industry.descriptionKey]}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  size="sm"
                  className="ml-[4.75rem] w-fit shrink-0 sm:ml-0"
                >
                  {i[industry.tagKey]}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
