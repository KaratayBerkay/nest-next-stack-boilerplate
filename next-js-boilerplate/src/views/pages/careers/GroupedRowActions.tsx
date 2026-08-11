"use client";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers7Category,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const CATEGORIES: Careers7Category[] = [
  {
    titleKey: "careers7Category1Title",
    jobs: [
      {
        titleKey: "careers7Category1Job1Title",
        locationKey: "careers7Category1Job1Location",
      },
      {
        titleKey: "careers7Category1Job2Title",
        locationKey: "careers7Category1Job2Location",
      },
      {
        titleKey: "careers7Category1Job3Title",
        locationKey: "careers7Category1Job3Location",
      },
      {
        titleKey: "careers7Category1Job4Title",
        locationKey: "careers7Category1Job4Location",
      },
    ],
  },
  {
    titleKey: "careers7Category2Title",
    jobs: [
      {
        titleKey: "careers7Category2Job1Title",
        locationKey: "careers7Category2Job1Location",
      },
      {
        titleKey: "careers7Category2Job2Title",
        locationKey: "careers7Category2Job2Location",
      },
    ],
  },
  {
    titleKey: "careers7Category3Title",
    jobs: [
      {
        titleKey: "careers7Category3Job1Title",
        locationKey: "careers7Category3Job1Location",
      },
      {
        titleKey: "careers7Category3Job2Title",
        locationKey: "careers7Category3Job2Location",
      },
      {
        titleKey: "careers7Category3Job3Title",
        locationKey: "careers7Category3Job3Location",
      },
    ],
  },
  {
    titleKey: "careers7Category4Title",
    jobs: [
      {
        titleKey: "careers7Category4Job1Title",
        locationKey: "careers7Category4Job1Location",
      },
      {
        titleKey: "careers7Category4Job2Title",
        locationKey: "careers7Category4Job2Location",
      },
    ],
  },
  {
    titleKey: "careers7Category5Title",
    jobs: [
      {
        titleKey: "careers7Category5Job1Title",
        locationKey: "careers7Category5Job1Location",
      },
      {
        titleKey: "careers7Category5Job2Title",
        locationKey: "careers7Category5Job2Location",
      },
    ],
  },
];

export function GroupedRowActions() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const careers = t.careers;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-12 px-6 lg:px-8">
        <div className="border-border border-t pt-8">
          <div className="flex max-w-2xl flex-col gap-4">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {careers.careers7Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {careers.careers7Description}
            </Typography>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {CATEGORIES.map((category) => (
            <div key={category.titleKey} className="flex flex-col">
              <div className="flex flex-col gap-3 pb-3">
                <Typography
                  variant="h3"
                  className="text-xl font-medium tracking-tight"
                >
                  {careers[category.titleKey]}
                </Typography>
                <div className="border-border border-t" />
              </div>
              <ul className="flex flex-col">
                {category.jobs.map((job) => (
                  <li
                    key={job.titleKey}
                    className="border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b py-5"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-medium tracking-tight">
                        {careers[job.titleKey]}
                      </span>
                      <Typography variant="bodySmall" className="text-muted">
                        {careers[job.locationKey]}
                      </Typography>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href={LINK_URL}>{careers.careers7ViewRole}</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
