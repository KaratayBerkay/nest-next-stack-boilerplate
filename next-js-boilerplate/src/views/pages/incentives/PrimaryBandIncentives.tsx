"use client";

import { Fragment } from "react";
import type { IconProps } from "@tabler/icons-react";
import {
  IconAward,
  IconShieldCheck,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIncentivesMessages } from "@/types/pages/incentives/IncentivesMessages-types";

interface BandItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
}

const ITEMS: BandItem[] = [
  {
    id: "price-match",
    icon: IconShieldCheck,
    titleKey: "incentives2Item1Title",
  },
  {
    id: "delivery",
    icon: IconTruckDelivery,
    titleKey: "incentives2Item2Title",
  },
  { id: "rewards", icon: IconAward, titleKey: "incentives2Item3Title" },
];

export function PrimaryBandIncentives() {
  const m = useMessages("pages") as unknown as PagesWithIncentivesMessages;
  const t = m.incentives;

  return (
    <section className="bg-brand text-brand-fg w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center lg:px-8">
        <span className="text-xs font-semibold tracking-widest uppercase opacity-80">
          {t.incentives2Eyebrow}
        </span>
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
            {t.incentives2Heading}
          </h2>
          <p className="text-sm opacity-80 lg:text-base">
            {t.incentives2Description}
          </p>
        </div>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-0">
          {ITEMS.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && (
                <span className="bg-brand-fg/25 hidden h-10 w-px shrink-0 sm:mx-8 sm:block" />
              )}
              <div className="flex flex-col items-center gap-2 px-2">
                <item.icon size={26} aria-hidden="true" />
                <span className="text-sm font-medium">{t[item.titleKey]}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
