"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconBolt,
  IconCalendarTime,
  IconCertificate,
  IconReceipt,
  IconShieldLock,
  IconThumbUp,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIncentivesMessages } from "@/types/pages/incentives/IncentivesMessages-types";

interface ServiceCardItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
  descKey: string;
}

const ITEMS: ServiceCardItem[] = [
  {
    id: "quality",
    icon: IconShieldLock,
    titleKey: "incentives6Item1Title",
    descKey: "incentives6Item1Desc",
  },
  {
    id: "certified",
    icon: IconCertificate,
    titleKey: "incentives6Item2Title",
    descKey: "incentives6Item2Desc",
  },
  {
    id: "scheduling",
    icon: IconCalendarTime,
    titleKey: "incentives6Item3Title",
    descKey: "incentives6Item3Desc",
  },
  {
    id: "pricing",
    icon: IconReceipt,
    titleKey: "incentives6Item4Title",
    descKey: "incentives6Item4Desc",
  },
  {
    id: "response",
    icon: IconBolt,
    titleKey: "incentives6Item5Title",
    descKey: "incentives6Item5Desc",
  },
  {
    id: "satisfaction",
    icon: IconThumbUp,
    titleKey: "incentives6Item6Title",
    descKey: "incentives6Item6Desc",
  },
];

export function OutlinedServiceGridIncentives() {
  const m = useMessages("pages") as unknown as PagesWithIncentivesMessages;
  const t = m.incentives;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center lg:mb-16">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {t.incentives6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {t.incentives6Heading}
          </h2>
          <p className="text-muted">{t.incentives6Description}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <Card
              key={item.id}
              variant="outline"
              className="flex flex-col gap-4 p-6"
            >
              <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full">
                <item.icon size={22} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-fg font-semibold">{t[item.titleKey]}</h3>
                <p className="text-muted text-sm">{t[item.descKey]}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
