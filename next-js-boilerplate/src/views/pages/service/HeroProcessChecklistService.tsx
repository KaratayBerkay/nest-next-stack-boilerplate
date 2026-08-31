"use client";

import { IconCheck, IconDeviceLaptop } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServiceMessages } from "@/types/pages/service/ServiceMessages-types";

const STATS = [
  {
    id: "shipped",
    valueKey: "service1Stat1Value",
    labelKey: "service1Stat1Label",
  },
  {
    id: "rating",
    valueKey: "service1Stat2Value",
    labelKey: "service1Stat2Label",
  },
  {
    id: "turnaround",
    valueKey: "service1Stat3Value",
    labelKey: "service1Stat3Label",
  },
] as const;

const STEPS = [
  {
    id: "discover",
    titleKey: "service1Step1Title",
    bodyKey: "service1Step1Body",
  },
  {
    id: "design",
    titleKey: "service1Step2Title",
    bodyKey: "service1Step2Body",
  },
  { id: "build", titleKey: "service1Step3Title", bodyKey: "service1Step3Body" },
  {
    id: "launch",
    titleKey: "service1Step4Title",
    bodyKey: "service1Step4Body",
  },
] as const;

const CHECKLIST = [
  { id: "responsive", key: "service1Check1" },
  { id: "a11y", key: "service1Check2" },
  { id: "seo", key: "service1Check3" },
  { id: "support", key: "service1Check4" },
] as const;

export function HeroProcessChecklistService() {
  const t = useMessages("pages") as unknown as PagesWithServiceMessages;
  const s = t.service;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <Badge variant="soft" size="sm" className="w-fit">
          <IconDeviceLaptop size={14} className="mr-1.5" aria-hidden="true" />
          {s.service1Eyebrow}
        </Badge>
        <h1 className="text-fg max-w-3xl text-4xl font-semibold tracking-tight lg:text-5xl">
          {s.service1Heading}
        </h1>
        <p className="text-muted max-w-2xl text-lg leading-relaxed">
          {s.service1Lead}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary">{s.service1CtaPrimary}</Button>
          <Button variant="outline">{s.service1CtaSecondary}</Button>
        </div>
      </div>

      <div className="border-border mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-4 border-y px-6 py-8 lg:px-8">
        {STATS.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-center gap-1 text-center"
          >
            <span className="text-fg text-2xl font-semibold tracking-tight tabular-nums lg:text-3xl">
              {s[stat.valueKey]}
            </span>
            <span className="text-muted text-xs lg:text-sm">
              {s[stat.labelKey]}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-4xl px-6 lg:px-8">
        <h2 className="text-fg mb-8 text-2xl font-semibold tracking-tight">
          {s.service1ProcessHeading}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className="border-border flex flex-col gap-2 border-l pl-6"
            >
              <span className="text-muted text-sm font-medium">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-fg text-base font-semibold">
                {s[step.titleKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {s[step.bodyKey]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl px-6 lg:px-8">
        <div className="border-border bg-surface rounded-xl border p-6 lg:p-8">
          <h2 className="text-fg mb-5 text-lg font-semibold">
            {s.service1ChecklistHeading}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5">
                <span className="bg-brand/10 text-brand flex size-5 shrink-0 items-center justify-center rounded-full">
                  <IconCheck size={12} aria-hidden="true" />
                </span>
                <span className="text-fg text-sm">{s[item.key]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
