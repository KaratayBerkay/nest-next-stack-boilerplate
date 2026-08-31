"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers9Job,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const JOBS: Careers9Job[] = [
  {
    categoryKey: "careers9Job1Category",
    titleKey: "careers9Job1Title",
    locationKey: "careers9Job1Location",
  },
  {
    categoryKey: "careers9Job2Category",
    titleKey: "careers9Job2Title",
    locationKey: "careers9Job2Location",
  },
  {
    categoryKey: "careers9Job3Category",
    titleKey: "careers9Job3Title",
    locationKey: "careers9Job3Location",
  },
  {
    categoryKey: "careers9Job4Category",
    titleKey: "careers9Job4Title",
    locationKey: "careers9Job4Location",
  },
  {
    categoryKey: "careers9Job5Category",
    titleKey: "careers9Job5Title",
    locationKey: "careers9Job5Location",
  },
  {
    categoryKey: "careers9Job6Category",
    titleKey: "careers9Job6Title",
    locationKey: "careers9Job6Location",
  },
  {
    categoryKey: "careers9Job7Category",
    titleKey: "careers9Job7Title",
    locationKey: "careers9Job7Location",
  },
  {
    categoryKey: "careers9Job8Category",
    titleKey: "careers9Job8Title",
    locationKey: "careers9Job8Location",
  },
  {
    categoryKey: "careers9Job9Category",
    titleKey: "careers9Job9Title",
    locationKey: "careers9Job9Location",
  },
  {
    categoryKey: "careers9Job10Category",
    titleKey: "careers9Job10Title",
    locationKey: "careers9Job10Location",
  },
  {
    categoryKey: "careers9Job11Category",
    titleKey: "careers9Job11Title",
    locationKey: "careers9Job11Location",
  },
  {
    categoryKey: "careers9Job12Category",
    titleKey: "careers9Job12Title",
    locationKey: "careers9Job12Location",
  },
  {
    categoryKey: "careers9Job13Category",
    titleKey: "careers9Job13Title",
    locationKey: "careers9Job13Location",
  },
];

export function GradientGeneralApplication() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const careers = t.careers;

  return (
    <section className="from-surface to-bg w-full bg-gradient-to-b py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {careers.careers9Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {careers.careers9Description}
          </Typography>
        </div>

        <div className="border-border divide-border flex flex-col divide-y rounded-2xl border">
          <div className="border-border hidden border-b px-6 py-4 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:gap-8">
            <Typography variant="overline">
              {careers.careers9ColumnRole}
            </Typography>
            <Typography variant="overline">
              {careers.careers9ColumnLocation}
            </Typography>
            <span
              aria-hidden="true"
              className="text-muted text-xs font-semibold tracking-wider uppercase"
            >
              +
            </span>
          </div>
          {JOBS.map((job) => (
            <a
              key={job.titleKey}
              href={LINK_URL}
              className="hover:bg-surface-hover group flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-5 transition-colors md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center md:gap-8 md:px-6"
            >
              <div className="flex min-w-0 flex-col gap-2">
                <Badge variant="outline" size="sm" className="w-fit">
                  {careers[job.categoryKey]}
                </Badge>
                <span className="text-lg font-medium tracking-tight">
                  {careers[job.titleKey]}
                </span>
              </div>
              <Typography variant="bodySmall" className="text-muted">
                {careers[job.locationKey]}
              </Typography>
              <IconArrowRight
                size={16}
                aria-hidden="true"
                className="text-muted ml-auto transition-transform group-hover:translate-x-0.5 md:ml-0"
              />
            </a>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <Typography variant="body" className="text-muted">
            {careers.careers9FooterText}
          </Typography>
          <a
            href={LINK_URL}
            className="text-brand group inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {careers.careers9FooterLink}
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
