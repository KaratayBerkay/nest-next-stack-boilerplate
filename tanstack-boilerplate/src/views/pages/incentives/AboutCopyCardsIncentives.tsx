"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconBolt,
  IconHeartHandshake,
  IconRosetteDiscountCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIncentivesMessages } from "@/types/pages/incentives/IncentivesMessages-types";

interface AboutCardItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  titleKey: string;
  descKey: string;
}

const ITEMS: AboutCardItem[] = [
  {
    id: "trusted",
    icon: IconUsers,
    titleKey: "incentives7Item1Title",
    descKey: "incentives7Item1Desc",
  },
  {
    id: "fast",
    icon: IconBolt,
    titleKey: "incentives7Item2Title",
    descKey: "incentives7Item2Desc",
  },
  {
    id: "support",
    icon: IconHeartHandshake,
    titleKey: "incentives7Item3Title",
    descKey: "incentives7Item3Desc",
  },
  {
    id: "verified",
    icon: IconRosetteDiscountCheck,
    titleKey: "incentives7Item4Title",
    descKey: "incentives7Item4Desc",
  },
];

export function AboutCopyCardsIncentives() {
  const m = useMessages("pages") as unknown as PagesWithIncentivesMessages;
  const t = m.incentives;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-4">
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              {t.incentives7Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {t.incentives7Heading}
            </h2>
            <p className="text-muted lg:text-lg">{t.incentives7Body}</p>
            <Button variant="primary" size="lg" className="mt-2 !rounded-full">
              {t.incentives7Cta}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ITEMS.map((item) => (
              <Card key={item.id} className="flex flex-col gap-3 p-5">
                <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-full">
                  <item.icon size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-fg text-sm font-semibold">
                    {t[item.titleKey]}
                  </h3>
                  <p className="text-muted text-xs">{t[item.descKey]}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
