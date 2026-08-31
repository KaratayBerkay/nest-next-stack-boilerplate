"use client";

import { IconArrowRight, IconMapPin } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers3Category,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const CATEGORIES: Careers3Category[] = [
  {
    titleKey: "careers3Category1Title",
    jobs: [
      {
        titleKey: "careers3Category1Job1Title",
        descriptionKey: "careers3Category1Job1Description",
        locationKey: "careers3Category1Job1Location",
      },
      {
        titleKey: "careers3Category1Job2Title",
        descriptionKey: "careers3Category1Job2Description",
        locationKey: "careers3Category1Job2Location",
      },
      {
        titleKey: "careers3Category1Job3Title",
        descriptionKey: "careers3Category1Job3Description",
        locationKey: "careers3Category1Job3Location",
      },
    ],
  },
  {
    titleKey: "careers3Category2Title",
    jobs: [
      {
        titleKey: "careers3Category2Job1Title",
        descriptionKey: "careers3Category2Job1Description",
        locationKey: "careers3Category2Job1Location",
      },
      {
        titleKey: "careers3Category2Job2Title",
        descriptionKey: "careers3Category2Job2Description",
        locationKey: "careers3Category2Job2Location",
      },
    ],
  },
  {
    titleKey: "careers3Category3Title",
    jobs: [
      {
        titleKey: "careers3Category3Job1Title",
        descriptionKey: "careers3Category3Job1Description",
        locationKey: "careers3Category3Job1Location",
      },
      {
        titleKey: "careers3Category3Job2Title",
        descriptionKey: "careers3Category3Job2Description",
        locationKey: "careers3Category3Job2Location",
      },
    ],
  },
  {
    titleKey: "careers3Category4Title",
    jobs: [
      {
        titleKey: "careers3Category4Job1Title",
        descriptionKey: "careers3Category4Job1Description",
        locationKey: "careers3Category4Job1Location",
      },
      {
        titleKey: "careers3Category4Job2Title",
        descriptionKey: "careers3Category4Job2Description",
        locationKey: "careers3Category4Job2Location",
      },
    ],
  },
];

export function CategoryBadgeOpenings() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const careers = t.careers;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {careers.careers3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {careers.careers3Description}
          </Typography>
        </div>

        <div className="flex flex-col gap-12">
          {CATEGORIES.map((category) => (
            <div key={category.titleKey} className="flex flex-col gap-6">
              <Badge variant="outline" size="sm" className="w-fit">
                {careers[category.titleKey]}
              </Badge>
              <div className="divide-border divide-y">
                {category.jobs.map((job) => (
                  <a
                    key={job.titleKey}
                    href={LINK_URL}
                    className="group flex items-center justify-between gap-4 py-5"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium underline-offset-4 group-hover:underline">
                        {careers[job.titleKey]}
                      </span>
                      <span className="text-muted text-sm">
                        {careers[job.descriptionKey]}
                      </span>
                    </div>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-muted flex items-center gap-1.5 text-sm">
                        <IconMapPin size={15} aria-hidden="true" />
                        {careers[job.locationKey]}
                      </span>
                      <IconArrowRight
                        size={18}
                        aria-hidden="true"
                        className="text-muted group-hover:text-brand transition-all duration-300 group-hover:translate-x-0.5"
                      />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
