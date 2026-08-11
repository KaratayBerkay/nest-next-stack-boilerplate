"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers4Category,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const CATEGORIES: Careers4Category[] = [
  {
    titleKey: "careers4Category1Title",
    jobs: [
      {
        titleKey: "careers4Category1Job1Title",
        locationKey: "careers4Category1Job1Location",
      },
      {
        titleKey: "careers4Category1Job2Title",
        locationKey: "careers4Category1Job2Location",
      },
      {
        titleKey: "careers4Category1Job3Title",
        locationKey: "careers4Category1Job3Location",
      },
      {
        titleKey: "careers4Category1Job4Title",
        locationKey: "careers4Category1Job4Location",
      },
    ],
  },
  {
    titleKey: "careers4Category2Title",
    jobs: [
      {
        titleKey: "careers4Category2Job1Title",
        locationKey: "careers4Category2Job1Location",
      },
      {
        titleKey: "careers4Category2Job2Title",
        locationKey: "careers4Category2Job2Location",
      },
    ],
  },
  {
    titleKey: "careers4Category3Title",
    jobs: [
      {
        titleKey: "careers4Category3Job1Title",
        locationKey: "careers4Category3Job1Location",
      },
    ],
  },
  {
    titleKey: "careers4Category4Title",
    jobs: [
      {
        titleKey: "careers4Category4Job1Title",
        locationKey: "careers4Category4Job1Location",
      },
    ],
  },
  {
    titleKey: "careers4Category5Title",
    jobs: [
      {
        titleKey: "careers4Category5Job1Title",
        locationKey: "careers4Category5Job1Location",
      },
    ],
  },
  {
    titleKey: "careers4Category6Title",
    jobs: [
      {
        titleKey: "careers4Category6Job1Title",
        locationKey: "careers4Category6Job1Location",
      },
    ],
  },
];

export function CategorySectionsHeading() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const c = t.careers;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <Typography
          variant="h2"
          className="text-3xl font-medium tracking-tighter md:text-4xl"
        >
          {c.careers4Heading}
        </Typography>
        <div className="flex flex-col gap-12">
          {CATEGORIES.map((category) => (
            <div key={category.titleKey} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Typography variant="h3" className="text-lg">
                  {c[category.titleKey]}
                </Typography>
                <div className="border-border border-t" />
              </div>
              <div className="border-border divide-border flex flex-col divide-y rounded-2xl border">
                {category.jobs.map((job) => (
                  <div
                    key={job.titleKey}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <a
                      href={LINK_URL}
                      className="hover:text-brand font-medium transition-colors"
                    >
                      {c[job.titleKey]}
                    </a>
                    <div className="flex items-center gap-3">
                      <Typography variant="bodySmall" className="text-muted">
                        {c[job.locationKey]}
                      </Typography>
                      <IconArrowUpRight
                        size={16}
                        className="text-muted"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
