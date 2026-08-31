"use client";

import { IconArrowRight, IconCircleCheck, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

const BEFORE_POINT_KEYS = [
  "integration6BeforePoint1",
  "integration6BeforePoint2",
  "integration6BeforePoint3",
  "integration6BeforePoint4",
];

const AFTER_POINT_KEYS = [
  "integration6AfterPoint1",
  "integration6AfterPoint2",
  "integration6AfterPoint3",
  "integration6AfterPoint4",
];

export function BeforeAfterComparisonIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {ig.integration6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {ig.integration6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{ig.integration6Intro}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <Card variant="outline">
            <div className="flex flex-col gap-5 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-fg text-lg font-semibold">
                  {ig.integration6BeforeTitle}
                </h3>
                <Badge variant="outline" size="sm">
                  {ig.integration6BeforeTag}
                </Badge>
              </div>
              <ul className="flex flex-col gap-3">
                {BEFORE_POINT_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <IconX
                      size={16}
                      aria-hidden="true"
                      className="text-error mt-0.5 shrink-0"
                    />
                    <span className="text-muted">{ig[key]}</span>
                  </li>
                ))}
              </ul>
              <div className="border-border border-t pt-4">
                <p className="text-fg text-2xl font-bold tracking-tight">
                  {ig.integration6BeforeStatValue}
                </p>
                <p className="text-muted text-xs">
                  {ig.integration6BeforeStatLabel}
                </p>
              </div>
            </div>
          </Card>

          <div className="border-border bg-surface hidden size-11 shrink-0 items-center justify-center rounded-full border shadow-xs lg:flex">
            <IconArrowRight
              size={20}
              aria-hidden="true"
              className="text-brand"
            />
          </div>

          <Card variant="elevated">
            <div className="flex flex-col gap-5 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-fg text-lg font-semibold">
                  {ig.integration6AfterTitle}
                </h3>
                <Badge variant="soft" size="sm">
                  {ig.integration6AfterTag}
                </Badge>
              </div>
              <ul className="flex flex-col gap-3">
                {AFTER_POINT_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <IconCircleCheck
                      size={16}
                      aria-hidden="true"
                      className="text-success mt-0.5 shrink-0"
                    />
                    <span className="text-fg">{ig[key]}</span>
                  </li>
                ))}
              </ul>
              <div className="border-border border-t pt-4">
                <p className="text-brand text-2xl font-bold tracking-tight">
                  {ig.integration6AfterStatValue}
                </p>
                <p className="text-muted text-xs">
                  {ig.integration6AfterStatLabel}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
