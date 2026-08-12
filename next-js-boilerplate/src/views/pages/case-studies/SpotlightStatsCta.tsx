"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy4Stat,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const LINK_URL = "https://example.com" as const;

const STATS: CaseStudy4Stat[] = [
  { valueKey: "caseStudy4Stat1Value", labelKey: "caseStudy4Stat1Label" },
  { valueKey: "caseStudy4Stat2Value", labelKey: "caseStudy4Stat2Label" },
  { valueKey: "caseStudy4Stat3Value", labelKey: "caseStudy4Stat3Label" },
];

export function SpotlightStatsCta() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {cs.caseStudy4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cs.caseStudy4Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-10 overflow-hidden rounded-3xl border p-8 md:p-12 lg:p-14">
          <div className="flex max-w-3xl flex-col gap-4">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-5xl"
            >
              {cs.caseStudy4Headline}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {cs.caseStudy4Body}
            </Typography>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.valueKey} className="flex flex-col gap-1">
                <span className="text-brand text-3xl font-semibold tracking-tight md:text-4xl">
                  {cs[stat.valueKey]}
                </span>
                <span className="text-muted text-sm">{cs[stat.labelKey]}</span>
              </div>
            ))}
          </div>
          <Button asChild className="w-fit">
            <a href={LINK_URL}>
              {cs.caseStudy4Cta}
              <IconArrowUpRight size={16} aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
