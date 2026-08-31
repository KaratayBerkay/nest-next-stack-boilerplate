"use client";

import Image from "next/image";
import {
  IconCircleCheck,
  IconClock,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Quote } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCaseStudyMessages } from "@/types/pages/case-study/CaseStudyMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const SECTIONS = [
  {
    headingKey: "caseStudy1ChallengeHeading",
    bodyKey: "caseStudy1ChallengeBody",
    quote: false,
  },
  {
    headingKey: "caseStudy1ApproachHeading",
    bodyKey: "caseStudy1ApproachBody",
    quote: true,
  },
  {
    headingKey: "caseStudy1ResultHeading",
    bodyKey: "caseStudy1ResultBody",
    quote: false,
  },
] as const;

const INFO_ROWS = [
  { labelKey: "caseStudy1InfoTimelineLabel", valueKey: "caseStudy1InfoTimelineValue" },
  { labelKey: "caseStudy1InfoTeamLabel", valueKey: "caseStudy1InfoTeamValue" },
  { labelKey: "caseStudy1InfoLocationLabel", valueKey: "caseStudy1InfoLocationValue" },
] as const;

const METRICS = [
  {
    icon: IconTrendingUp,
    labelKey: "caseStudy1Metric1Label",
    period1Key: "caseStudy1Metric1ValuePeriod1",
    period2Key: "caseStudy1Metric1ValuePeriod2",
  },
  {
    icon: IconUsers,
    labelKey: "caseStudy1Metric2Label",
    period1Key: "caseStudy1Metric2ValuePeriod1",
    period2Key: "caseStudy1Metric2ValuePeriod2",
  },
  {
    icon: IconClock,
    labelKey: "caseStudy1Metric3Label",
    period1Key: "caseStudy1Metric3ValuePeriod1",
    period2Key: "caseStudy1Metric3ValuePeriod2",
  },
  {
    icon: IconTarget,
    labelKey: "caseStudy1Metric4Label",
    period1Key: "caseStudy1Metric4ValuePeriod1",
    period2Key: "caseStudy1Metric4ValuePeriod2",
  },
] as const;

const HIGHLIGHTS = [
  "caseStudy1ReportHighlight1",
  "caseStudy1ReportHighlight2",
  "caseStudy1ReportHighlight3",
] as const;

function MetricsGrid({
  cs,
  valueField,
}: {
  cs: PagesWithCaseStudyMessages["caseStudy"];
  valueField: "period1Key" | "period2Key";
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {METRICS.map((metric) => (
        <div
          key={metric.labelKey}
          className="border-border bg-surface flex flex-col gap-1 rounded-lg border p-3"
        >
          <metric.icon size={16} className="text-brand" aria-hidden="true" />
          <span className="text-fg text-lg font-semibold">
            {cs[metric[valueField]]}
          </span>
          <span className="text-muted text-xs">{cs[metric.labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

export function MetricsSidebarCaseStudy() {
  const t = useMessages("pages") as unknown as PagesWithCaseStudyMessages;
  const cs = t.caseStudy;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border flex flex-col items-start gap-4 border-b pb-10">
          <Badge variant="soft">{cs.caseStudy1Industry}</Badge>
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {cs.caseStudy1Title}
          </h1>
          <p className="text-muted max-w-2xl text-lg leading-relaxed">
            {cs.caseStudy1Lead}
          </p>
        </div>

        <div className="border-border bg-surface mt-10 overflow-hidden rounded-2xl border">
          <AspectRatio ratio={2 / 1}>
            <Image
              src={placeholderImage("case-study-1-hero", "2x1")}
              alt={cs.caseStudy1HeroAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </AspectRatio>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-14">
          <div className="flex flex-col gap-10 lg:col-span-2">
            {SECTIONS.map((section) => (
              <div key={section.headingKey} className="flex flex-col gap-3">
                <h2 className="text-fg text-xl font-semibold">
                  {cs[section.headingKey]}
                </h2>
                <p className="text-muted leading-relaxed">
                  {cs[section.bodyKey]}
                </p>
                {section.quote && (
                  <Quote className="text-fg">
                    <p className="text-lg font-medium">
                      {cs.caseStudy1QuoteText}
                    </p>
                    <footer className="text-muted mt-2 text-sm not-italic">
                      {cs.caseStudy1QuoteName} — {cs.caseStudy1QuoteRole}
                    </footer>
                  </Quote>
                )}
              </div>
            ))}
          </div>

          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar
                      variant="brand"
                      fallback={cs.caseStudy1ClientName.slice(0, 2)}
                      size="lg"
                    />
                    <div className="flex flex-col">
                      <CardTitle>{cs.caseStudy1ClientName}</CardTitle>
                      <CardDescription>
                        {cs.caseStudy1ClientIndustry}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2 text-sm">
                    {INFO_ROWS.map((row) => (
                      <div
                        key={row.labelKey}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted">{cs[row.labelKey]}</span>
                        <span className="text-fg font-medium">
                          {cs[row.valueKey]}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator label={cs.caseStudy1ResultsLabel} />

                  <Tabs defaultValue="period1">
                    <TabsList className="w-full">
                      <TabsTrigger value="period1" className="flex-1">
                        {cs.caseStudy1Period1Label}
                      </TabsTrigger>
                      <TabsTrigger value="period2" className="flex-1">
                        {cs.caseStudy1Period2Label}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="period1" className="mt-4">
                      <MetricsGrid cs={cs} valueField="period1Key" />
                    </TabsContent>
                    <TabsContent value="period2" className="mt-4">
                      <MetricsGrid cs={cs} valueField="period2Key" />
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger
                      variant="primary"
                      className="w-full justify-center"
                    >
                      {cs.caseStudy1ReportCta}
                    </DialogTrigger>
                    <DialogContent
                      size="lg"
                      closeLabel={cs.caseStudy1ReportDialogCloseAria}
                    >
                      <DialogHeader>
                        <DialogTitle>
                          {cs.caseStudy1ReportDialogTitle}
                        </DialogTitle>
                        <DialogDescription>
                          {cs.caseStudy1ReportDialogDescription}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogBody>
                        <ul className="flex flex-col gap-3">
                          {HIGHLIGHTS.map((key) => (
                            <li
                              key={key}
                              className="flex items-start gap-2 text-sm"
                            >
                              <IconCircleCheck
                                size={16}
                                className="text-brand mt-0.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-muted">{cs[key]}</span>
                            </li>
                          ))}
                        </ul>
                      </DialogBody>
                      <DialogFooter>
                        <DialogClose variant="outline">
                          {cs.caseStudy1ReportDialogClose}
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
