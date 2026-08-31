"use client";

import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAwardsMessages } from "@/types/pages/awards/AwardsMessages-types";

interface AwardItem {
  id: string;
  yearKey: string;
  titleKey: string;
  descriptionKey: string;
}

const ITEMS: AwardItem[] = [
  {
    id: "item-1",
    yearKey: "awards2Item1Year",
    titleKey: "awards2Item1Title",
    descriptionKey: "awards2Item1Description",
  },
  {
    id: "item-2",
    yearKey: "awards2Item2Year",
    titleKey: "awards2Item2Title",
    descriptionKey: "awards2Item2Description",
  },
  {
    id: "item-3",
    yearKey: "awards2Item3Year",
    titleKey: "awards2Item3Title",
    descriptionKey: "awards2Item3Description",
  },
  {
    id: "item-4",
    yearKey: "awards2Item4Year",
    titleKey: "awards2Item4Title",
    descriptionKey: "awards2Item4Description",
  },
  {
    id: "item-5",
    yearKey: "awards2Item5Year",
    titleKey: "awards2Item5Title",
    descriptionKey: "awards2Item5Description",
  },
];

export function StickyLabelAwards() {
  const t = useMessages("pages") as unknown as PagesWithAwardsMessages;
  const a = t.awards;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-4 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <Badge variant="soft" size="sm">
            {a.awards2Badge}
          </Badge>
          <h2 className="text-fg text-3xl font-medium tracking-tighter md:text-4xl">
            {a.awards2Heading}
          </h2>
          <p className="text-muted">{a.awards2Description}</p>
          <div className="border-border mt-2 flex flex-col gap-0.5 border-t pt-4">
            <span className="text-fg text-4xl font-semibold tracking-tight">
              {a.awards2StatValue}
            </span>
            <span className="text-muted text-sm">{a.awards2StatLabel}</span>
          </div>
        </div>

        <div className="lg:col-span-8">
          <ol className="border-border divide-border flex flex-col divide-y border-t">
            {ITEMS.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[4.5rem_1fr] gap-4 py-6 sm:grid-cols-[6rem_1fr]"
              >
                <span className="text-muted text-sm font-medium tabular-nums">
                  {a[item.yearKey]}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-fg text-lg font-semibold">
                    {a[item.titleKey]}
                  </span>
                  <p className="text-muted text-sm leading-relaxed">
                    {a[item.descriptionKey]}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
