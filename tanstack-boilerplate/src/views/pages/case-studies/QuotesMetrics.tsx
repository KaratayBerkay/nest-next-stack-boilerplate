"use client";

import { IconQuote } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CaseStudy2Item,
  PagesWithCaseStudiesMessages,
} from "@/types/pages/case-studies/CaseStudiesMessages-types";

const ITEMS: CaseStudy2Item[] = [
  {
    quoteKey: "caseStudy2Item1Quote",
    nameKey: "caseStudy2Item1Name",
    roleKey: "caseStudy2Item1Role",
    metricValueKey: "caseStudy2Item1MetricValue",
    metricLabelKey: "caseStudy2Item1MetricLabel",
  },
  {
    quoteKey: "caseStudy2Item2Quote",
    nameKey: "caseStudy2Item2Name",
    roleKey: "caseStudy2Item2Role",
    metricValueKey: "caseStudy2Item2MetricValue",
    metricLabelKey: "caseStudy2Item2MetricLabel",
  },
  {
    quoteKey: "caseStudy2Item3Quote",
    nameKey: "caseStudy2Item3Name",
    roleKey: "caseStudy2Item3Role",
    metricValueKey: "caseStudy2Item3MetricValue",
    metricLabelKey: "caseStudy2Item3MetricLabel",
  },
  {
    quoteKey: "caseStudy2Item4Quote",
    nameKey: "caseStudy2Item4Name",
    roleKey: "caseStudy2Item4Role",
    metricValueKey: "caseStudy2Item4MetricValue",
    metricLabelKey: "caseStudy2Item4MetricLabel",
  },
];

export function QuotesMetrics() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudiesMessages;
  const cs = t.caseStudies;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {cs.caseStudy2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {cs.caseStudy2Description}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {ITEMS.map((item) => (
            <figure
              key={item.quoteKey}
              className="border-border bg-surface flex flex-col justify-between gap-8 rounded-2xl border p-6 lg:p-8"
            >
              <div className="flex flex-col gap-5">
                <IconQuote
                  size={28}
                  aria-hidden="true"
                  className="text-brand"
                />
                <Typography
                  variant="h3"
                  className="text-xl font-medium tracking-tight lg:text-2xl"
                >
                  {cs[item.quoteKey]}
                </Typography>
              </div>
              <figcaption className="border-border flex items-end justify-between gap-6 border-t pt-6">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{cs[item.nameKey]}</span>
                  <span className="text-muted text-sm">{cs[item.roleKey]}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-brand text-3xl font-semibold tracking-tight">
                    {cs[item.metricValueKey]}
                  </span>
                  <span className="text-muted text-right text-sm">
                    {cs[item.metricLabelKey]}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
