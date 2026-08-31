"use client";

import { IconTrendingUp } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAwardsMessages } from "@/types/pages/awards/AwardsMessages-types";

interface Milestone {
  id: string;
  valueKey: string;
  labelKey: string;
}

const LINK_URL = "#" as const;

const MILESTONES: Milestone[] = [
  { id: "item-1", valueKey: "awards6Item1Value", labelKey: "awards6Item1Label" },
  { id: "item-2", valueKey: "awards6Item2Value", labelKey: "awards6Item2Label" },
  { id: "item-3", valueKey: "awards6Item3Value", labelKey: "awards6Item3Label" },
  { id: "item-4", valueKey: "awards6Item4Value", labelKey: "awards6Item4Label" },
  { id: "item-5", valueKey: "awards6Item5Value", labelKey: "awards6Item5Label" },
  { id: "item-6", valueKey: "awards6Item6Value", labelKey: "awards6Item6Label" },
];

export function MilestoneGridAwards() {
  const t = useMessages("pages") as unknown as PagesWithAwardsMessages;
  const a = t.awards;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 lg:px-8">
        <div className="mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
            <IconTrendingUp size={14} aria-hidden="true" />
            {a.awards6Eyebrow}
          </p>
          <h2 className="text-fg text-3xl font-medium tracking-tighter md:text-4xl">
            {a.awards6Heading}
          </h2>
          <p className="text-muted">{a.awards6Description}</p>
        </div>

        <div className="border-border bg-surface divide-border grid w-full grid-cols-2 divide-x divide-y rounded-3xl border md:grid-cols-3">
          {MILESTONES.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-1 px-6 py-8 text-center"
            >
              <span className="text-fg text-4xl font-semibold tracking-tight">
                {a[item.valueKey]}
              </span>
              <span className="text-muted text-sm">{a[item.labelKey]}</span>
            </div>
          ))}
        </div>

        <Separator className="my-10 max-w-xs" />

        <Button asChild variant="outline" className="!rounded-full">
          <a href={LINK_URL}>{a.awards6Cta}</a>
        </Button>
      </div>
    </section>
  );
}
