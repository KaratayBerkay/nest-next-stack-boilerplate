"use client";

import {
  IconAward,
  IconBriefcase,
  IconChartBar,
  IconClock,
  IconGlobe,
  IconMapPin,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  Careers6Job,
  Careers6Stat,
  PagesWithCareersMessages,
} from "@/types/pages/careers/CareersMessages-types";

const LINK_URL = "https://example.com" as const;

const STATS: Careers6Stat[] = [
  { labelKey: "careers6Stat1Label", icon: IconUsers },
  { labelKey: "careers6Stat2Label", icon: IconGlobe },
  { labelKey: "careers6Stat3Label", icon: IconAward },
];

const JOB_FACT_ICONS = [
  { icon: IconBriefcase, field: "departmentKey" },
  { icon: IconMapPin, field: "locationKey" },
  { icon: IconClock, field: "scheduleKey" },
  { icon: IconWallet, field: "compensationKey" },
  { icon: IconChartBar, field: "experienceKey" },
] as const;

const JOBS: Careers6Job[] = [
  {
    titleKey: "careers6Job1Title",
    descriptionKey: "careers6Job1Description",
    departmentKey: "careers6Job1Department",
    locationKey: "careers6Job1Location",
    scheduleKey: "careers6Job1Schedule",
    compensationKey: "careers6Job1Compensation",
    experienceKey: "careers6Job1Experience",
  },
  {
    titleKey: "careers6Job2Title",
    descriptionKey: "careers6Job2Description",
    departmentKey: "careers6Job2Department",
    locationKey: "careers6Job2Location",
    scheduleKey: "careers6Job2Schedule",
    compensationKey: "careers6Job2Compensation",
    experienceKey: "careers6Job2Experience",
  },
  {
    titleKey: "careers6Job3Title",
    descriptionKey: "careers6Job3Description",
    departmentKey: "careers6Job3Department",
    locationKey: "careers6Job3Location",
    scheduleKey: "careers6Job3Schedule",
    compensationKey: "careers6Job3Compensation",
    experienceKey: "careers6Job3Experience",
  },
  {
    titleKey: "careers6Job4Title",
    descriptionKey: "careers6Job4Description",
    departmentKey: "careers6Job4Department",
    locationKey: "careers6Job4Location",
    scheduleKey: "careers6Job4Schedule",
    compensationKey: "careers6Job4Compensation",
    experienceKey: "careers6Job4Experience",
  },
  {
    titleKey: "careers6Job5Title",
    descriptionKey: "careers6Job5Description",
    departmentKey: "careers6Job5Department",
    locationKey: "careers6Job5Location",
    scheduleKey: "careers6Job5Schedule",
    compensationKey: "careers6Job5Compensation",
    experienceKey: "careers6Job5Experience",
  },
  {
    titleKey: "careers6Job6Title",
    descriptionKey: "careers6Job6Description",
    departmentKey: "careers6Job6Department",
    locationKey: "careers6Job6Location",
    scheduleKey: "careers6Job6Schedule",
    compensationKey: "careers6Job6Compensation",
    experienceKey: "careers6Job6Experience",
  },
];

export function StatsHeaderJobCards() {
  const t = useMessages("pages") as unknown as PagesWithCareersMessages;
  const c = t.careers;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {c.careers6Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {c.careers6Description}
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 pt-2">
            {STATS.map((stat) => (
              <div key={stat.labelKey} className="flex items-center gap-2">
                <stat.icon
                  size={18}
                  className="text-brand"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{c[stat.labelKey]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {JOBS.map((job) => (
            <article
              key={job.titleKey}
              className="border-border bg-surface flex flex-col justify-between gap-6 rounded-2xl border p-6 lg:flex-row lg:gap-10 lg:p-8"
            >
              <div className="flex flex-col gap-4 lg:max-w-sm">
                <Typography variant="h3">{c[job.titleKey]}</Typography>
                <Typography variant="bodySmall" className="text-muted">
                  {c[job.descriptionKey]}
                </Typography>
                <Button asChild variant="outline" className="mt-2 w-fit">
                  <a href={LINK_URL}>{c.careers6Apply}</a>
                </Button>
              </div>
              <div className="flex flex-col gap-3 lg:w-52 lg:shrink-0">
                {JOB_FACT_ICONS.map((fact) => (
                  <div key={fact.field} className="flex items-center gap-2.5">
                    <fact.icon
                      size={16}
                      className="text-muted shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm">{c[job[fact.field]]}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
