"use client";

import {
  IconArrowUpRight,
  IconFileCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithComplianceMessages } from "@/types/pages/compliance/ComplianceMessages-types";

const LINK_URL = "#" as const;

const METRICS = [
  { value: "256-bit", labelKey: "compliance9Metric1Label" },
  { value: "99.9%", labelKey: "compliance9Metric2Label" },
  { value: "24/7", labelKey: "compliance9Metric3Label" },
] as const;

const FRAMEWORKS = [
  {
    name: "SOC 2",
    icon: IconShieldCheck,
    statusKey: "compliance9Status1",
    descriptionKey: "compliance9Framework1Description",
  },
  {
    name: "ISO 27001",
    icon: IconFileCheck,
    statusKey: "compliance9Status2",
    descriptionKey: "compliance9Framework2Description",
  },
  {
    name: "FedRAMP",
    icon: IconShieldCheck,
    statusKey: "compliance9Status3",
    descriptionKey: "compliance9Framework3Description",
  },
  {
    name: "CIS",
    icon: IconFileCheck,
    statusKey: "compliance9Status4",
    descriptionKey: "compliance9Framework4Description",
  },
] as const;

export function TrustMetricsStatusCards() {
  const m = useMessages("pages") as unknown as PagesWithComplianceMessages;
  const co = m.compliance;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <div
              key={metric.labelKey}
              className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-6"
            >
              <span className="text-fg text-3xl font-semibold tracking-tight">
                {metric.value}
              </span>
              <span className="text-muted text-sm">{co[metric.labelKey]}</span>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-6 lg:sticky lg:top-24 lg:self-start">
            <span className="border-border text-muted rounded-full border px-3 py-1 text-xs font-medium tracking-[0.2em] uppercase">
              {co.compliance9Badge}
            </span>
            <h2 className="text-fg text-3xl font-bold tracking-tight md:text-4xl">
              {co.compliance9Title}
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              {co.compliance9Description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" asChild>
                <a href={LINK_URL}>
                  {co.compliance9PrimaryButton}
                  <IconArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={LINK_URL}>{co.compliance9SecondaryButton}</a>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {FRAMEWORKS.map((framework) => {
              const FrameworkIcon = framework.icon;
              return (
                <a
                  key={framework.name}
                  href={LINK_URL}
                  className="border-border bg-surface group hover:bg-surface-hover flex flex-col gap-3 rounded-xl border p-5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="border-border text-muted flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs">
                        <FrameworkIcon className="text-brand size-4" />
                        {framework.name}
                      </span>
                      <span className="text-muted border-border rounded-full border px-3 py-1 text-xs">
                        {co[framework.statusKey]}
                      </span>
                    </div>
                    <IconArrowUpRight className="text-muted size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    {co[framework.descriptionKey]}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
