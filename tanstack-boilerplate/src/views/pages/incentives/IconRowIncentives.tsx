"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconHeadset,
  IconLock,
  IconRotate2,
  IconTruck,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIncentivesMessages } from "@/types/pages/incentives/IncentivesMessages-types";

interface IncentiveRowItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
  descKey: string;
}

const ITEMS: IncentiveRowItem[] = [
  {
    id: "shipping",
    icon: IconTruck,
    titleKey: "incentives1Item1Title",
    descKey: "incentives1Item1Desc",
  },
  {
    id: "payment",
    icon: IconLock,
    titleKey: "incentives1Item2Title",
    descKey: "incentives1Item2Desc",
  },
  {
    id: "returns",
    icon: IconRotate2,
    titleKey: "incentives1Item3Title",
    descKey: "incentives1Item3Desc",
  },
  {
    id: "support",
    icon: IconHeadset,
    titleKey: "incentives1Item4Title",
    descKey: "incentives1Item4Desc",
  },
];

export function IconRowIncentives() {
  const m = useMessages("pages") as unknown as PagesWithIncentivesMessages;
  const t = m.incentives;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid grid-cols-1 divide-y divide-border rounded-2xl border md:grid-cols-4 md:divide-x md:divide-y-0">
          {ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-6">
              <span className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-full">
                <item.icon size={22} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-fg text-sm font-semibold">
                  {t[item.titleKey]}
                </span>
                <span className="text-muted text-xs">{t[item.descKey]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
