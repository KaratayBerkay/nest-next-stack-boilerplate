"use client";

import { IconMap } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers5Job,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const JOBS: Careers5Job[] = [
  {
    titleKey: "careers5Job1Title",
    descriptionKey: "careers5Job1Description",
    locationKey: "careers5Job1Location",
    salaryKey: "careers5Job1Salary",
  },
  {
    titleKey: "careers5Job2Title",
    descriptionKey: "careers5Job2Description",
    locationKey: "careers5Job2Location",
    salaryKey: "careers5Job2Salary",
  },
  {
    titleKey: "careers5Job3Title",
    descriptionKey: "careers5Job3Description",
    locationKey: "careers5Job3Location",
    salaryKey: "careers5Job3Salary",
  },
  {
    titleKey: "careers5Job4Title",
    descriptionKey: "careers5Job4Description",
    locationKey: "careers5Job4Location",
    salaryKey: "careers5Job4Salary",
  },
  {
    titleKey: "careers5Job5Title",
    descriptionKey: "careers5Job5Description",
    locationKey: "careers5Job5Location",
    salaryKey: "careers5Job5Salary",
  },
  {
    titleKey: "careers5Job6Title",
    descriptionKey: "careers5Job6Description",
    locationKey: "careers5Job6Location",
    salaryKey: "careers5Job6Salary",
  },
];

export function CenteredFullWidthStack() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const c = t.careers;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 pb-14 text-center lg:pb-20">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {c.careers5Heading}
          </Typography>
        </div>
        <div className="flex flex-col">
          {JOBS.map((job) => (
            <div
              key={job.titleKey}
              className="border-border flex flex-col gap-2 border-t py-6 md:flex-row md:items-center md:gap-8"
            >
              <div className="flex flex-col gap-1.5">
                <a
                  href={LINK_URL}
                  className="text-lg font-semibold underline-offset-4 hover:underline"
                >
                  {c[job.titleKey]}
                </a>
                <Typography variant="bodySmall" className="text-muted">
                  {c[job.descriptionKey]}
                </Typography>
              </div>
              <div className="flex items-center gap-3 md:ml-auto md:flex-row md:items-center md:gap-8">
                <span className="text-muted flex items-center gap-1.5">
                  <IconMap size={16} aria-hidden="true" />
                  {c[job.locationKey]}
                </span>
                <span className="ml-auto text-right font-medium md:ml-0 md:w-28">
                  {c[job.salaryKey]}
                </span>
              </div>
            </div>
          ))}
          <div className="border-border border-t" />
        </div>
      </div>
    </section>
  );
}
