"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconCertificate,
  IconDiscount2,
  IconGift,
  IconHeartHandshake,
  IconLeaf,
  IconReceipt,
  IconStar,
  IconTag,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIncentivesMessages } from "@/types/pages/incentives/IncentivesMessages-types";

const MARQUEE_CSS = `
@keyframes incentive-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
.animate-incentive-marquee {
  animation: incentive-marquee 32s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-incentive-marquee {
    animation: none;
  }
}
`;

interface MarqueeItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  labelKey: string;
}

const ITEMS: MarqueeItem[] = [
  { id: "wrapping", icon: IconGift, labelKey: "incentives5Item1" },
  { id: "points", icon: IconStar, labelKey: "incentives5Item2" },
  { id: "carbon", icon: IconLeaf, labelKey: "incentives5Item3" },
  { id: "price", icon: IconTag, labelKey: "incentives5Item4" },
  { id: "warranty", icon: IconCertificate, labelKey: "incentives5Item5" },
  { id: "giveback", icon: IconHeartHandshake, labelKey: "incentives5Item6" },
  { id: "discounts", icon: IconDiscount2, labelKey: "incentives5Item7" },
  { id: "receipt", icon: IconReceipt, labelKey: "incentives5Item8" },
];

export function IconMarqueeIncentives() {
  const m = useMessages("pages") as unknown as PagesWithIncentivesMessages;
  const t = m.incentives;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {t.incentives5Heading}
          </h2>
          <p className="text-muted">{t.incentives5Intro}</p>
        </div>
        <style>{MARQUEE_CSS}</style>
        <div className="relative mt-12 overflow-hidden">
          <div className="from-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
          <div className="from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent" />
          <div className="animate-incentive-marquee flex w-max items-center gap-3">
            {[...ITEMS, ...ITEMS].map((item, index) => (
              <Badge
                key={`${item.id}-${index}`}
                variant="soft"
                pill
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <item.icon size={16} aria-hidden="true" />
                {t[item.labelKey]}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
