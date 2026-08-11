"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers1Department,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const DEPARTMENTS: Careers1Department[] = [
  {
    titleKey: "careers1Department1Title",
    jobs: [
      {
        titleKey: "careers1Department1Job1Title",
        locationKey: "careers1Department1Job1Location",
      },
      {
        titleKey: "careers1Department1Job2Title",
        locationKey: "careers1Department1Job2Location",
      },
      {
        titleKey: "careers1Department1Job3Title",
        locationKey: "careers1Department1Job3Location",
      },
      {
        titleKey: "careers1Department1Job4Title",
        locationKey: "careers1Department1Job4Location",
      },
    ],
  },
  {
    titleKey: "careers1Department2Title",
    jobs: [
      {
        titleKey: "careers1Department2Job1Title",
        locationKey: "careers1Department2Job1Location",
      },
      {
        titleKey: "careers1Department2Job2Title",
        locationKey: "careers1Department2Job2Location",
      },
    ],
  },
  {
    titleKey: "careers1Department3Title",
    jobs: [
      {
        titleKey: "careers1Department3Job1Title",
        locationKey: "careers1Department3Job1Location",
      },
    ],
  },
  {
    titleKey: "careers1Department4Title",
    jobs: [
      {
        titleKey: "careers1Department4Job1Title",
        locationKey: "careers1Department4Job1Location",
      },
      {
        titleKey: "careers1Department4Job2Title",
        locationKey: "careers1Department4Job2Location",
      },
    ],
  },
];

export function DepartmentGroupedList() {
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
            {careers.careers1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {careers.careers1Description1}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {careers.careers1Description2}
          </Typography>
        </div>

        <div className="flex flex-col gap-12">
          {DEPARTMENTS.map((department) => (
            <div key={department.titleKey} className="flex flex-col gap-6">
              <Typography
                variant="h3"
                className="text-2xl font-medium tracking-tighter md:text-3xl"
              >
                {careers[department.titleKey]}
              </Typography>
              <div className="border-border divide-border divide-y rounded-2xl border">
                {department.jobs.map((job) => (
                  <a
                    key={job.titleKey}
                    href={LINK_URL}
                    className="hover:bg-surface-hover group flex items-center justify-between gap-4 px-5 py-4 transition-colors lg:px-6"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">
                        {careers[job.titleKey]}
                      </span>
                      <span className="text-muted text-sm">
                        {careers[job.locationKey]}
                      </span>
                    </span>
                    <IconArrowRight
                      size={18}
                      aria-hidden="true"
                      className="text-muted group-hover:text-fg -translate-x-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-border border-t pt-8">
          <a
            href={LINK_URL}
            className="text-brand group inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {careers.careers1ViewOpenings}
            <IconArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
