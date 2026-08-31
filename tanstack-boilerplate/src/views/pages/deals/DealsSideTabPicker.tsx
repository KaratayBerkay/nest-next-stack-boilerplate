"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconArrowRight,
  IconBolt,
  IconDiscount,
  IconTag,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/HoverCard";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type DealsMessages = Record<string, string>;

interface PagesWithDealsMessages {
  deals: DealsMessages;
}

type DealId = "starter" | "growth" | "premium";

interface DealExpert {
  nameKey: string;
  roleKey: string;
  lineKey: string;
  seed: string;
}

interface DealTab {
  id: DealId;
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
  priceKey: string;
  discountKey: string;
  ctaKey: string;
  icon: typeof IconTag;
  experts: DealExpert[];
}

const LINK_URL = "#" as const;
const AVATAR_URL = (seed: string) => placeholderImage(seed, "1x1");

const DEAL_TABS: DealTab[] = [
  {
    id: "starter",
    labelKey: "deals6Tab1Label",
    titleKey: "deals6Deal1Title",
    descriptionKey: "deals6Deal1Description",
    priceKey: "deals6Deal1Price",
    discountKey: "deals6Deal1Discount",
    ctaKey: "deals6Deal1Cta",
    icon: IconTag,
    experts: [
      {
        nameKey: "deals6Deal1Expert1Name",
        roleKey: "deals6Deal1Expert1Role",
        lineKey: "deals6Deal1Expert1Line",
        seed: "deals6-expert-starter-1",
      },
      {
        nameKey: "deals6Deal1Expert2Name",
        roleKey: "deals6Deal1Expert2Role",
        lineKey: "deals6Deal1Expert2Line",
        seed: "deals6-expert-starter-2",
      },
    ],
  },
  {
    id: "growth",
    labelKey: "deals6Tab2Label",
    titleKey: "deals6Deal2Title",
    descriptionKey: "deals6Deal2Description",
    priceKey: "deals6Deal2Price",
    discountKey: "deals6Deal2Discount",
    ctaKey: "deals6Deal2Cta",
    icon: IconBolt,
    experts: [
      {
        nameKey: "deals6Deal2Expert1Name",
        roleKey: "deals6Deal2Expert1Role",
        lineKey: "deals6Deal2Expert1Line",
        seed: "deals6-expert-growth-1",
      },
      {
        nameKey: "deals6Deal2Expert2Name",
        roleKey: "deals6Deal2Expert2Role",
        lineKey: "deals6Deal2Expert2Line",
        seed: "deals6-expert-growth-2",
      },
    ],
  },
  {
    id: "premium",
    labelKey: "deals6Tab3Label",
    titleKey: "deals6Deal3Title",
    descriptionKey: "deals6Deal3Description",
    priceKey: "deals6Deal3Price",
    discountKey: "deals6Deal3Discount",
    ctaKey: "deals6Deal3Cta",
    icon: IconDiscount,
    experts: [
      {
        nameKey: "deals6Deal3Expert1Name",
        roleKey: "deals6Deal3Expert1Role",
        lineKey: "deals6Deal3Expert1Line",
        seed: "deals6-expert-premium-1",
      },
      {
        nameKey: "deals6Deal3Expert2Name",
        roleKey: "deals6Deal3Expert2Role",
        lineKey: "deals6Deal3Expert2Line",
        seed: "deals6-expert-premium-2",
      },
    ],
  },
];

function handleTabSelect(
  dealId: DealId,
  setActiveDeal: Dispatch<SetStateAction<DealId>>,
) {
  setActiveDeal(dealId);
}

export function DealsSideTabPicker() {
  const t = useMessages("pages") as unknown as PagesWithDealsMessages;
  const d = t.deals;
  const [activeDeal, setActiveDeal] = useState<DealId>(DEAL_TABS[0].id);
  const deal = DEAL_TABS.find((tab) => tab.id === activeDeal) ?? DEAL_TABS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-12 flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.deals6Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.deals6Description}
          </Typography>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
          <div
            role="tablist"
            aria-label={d.deals6Heading}
            className="flex flex-row gap-2 lg:flex-col"
          >
            {DEAL_TABS.map((tab) => {
              const ItemIcon = tab.icon;
              const isActive = tab.id === activeDeal;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabSelect(tab.id, setActiveDeal)}
                  className={cn(
                    "border-border flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand text-brand-fg border-l-brand-fg border-l-[3px] shadow-xs"
                      : "bg-surface text-muted hover:bg-surface-hover hover:text-fg",
                  )}
                >
                  <ItemIcon
                    size={20}
                    className={cn(
                      "shrink-0",
                      isActive ? "text-brand-fg" : "text-brand",
                    )}
                  />
                  {d[tab.labelKey]}
                </button>
              );
            })}
          </div>

          <div className="bg-surface border-border flex flex-col gap-6 rounded-2xl border p-6 lg:p-10">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Typography
                  variant="h3"
                  className="text-2xl font-medium tracking-tight"
                >
                  {d[deal.titleKey]}
                </Typography>
                <Badge variant="soft">{d[deal.discountKey]}</Badge>
              </div>
              <Typography variant="bodyLarge" className="text-muted">
                {d[deal.descriptionKey]}
              </Typography>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <span className="text-fg text-4xl font-semibold tracking-tight">
                {d[deal.priceKey]}
              </span>
              <Button
                variant="primary"
                asChild
                rightIcon={<IconArrowRight size={18} />}
              >
                <a href={LINK_URL}>{d[deal.ctaKey]}</a>
              </Button>
            </div>

            <div className="border-border flex flex-col gap-3 border-t pt-6">
              <p className="text-muted text-sm font-medium">
                {d.deals6ExpertsLabel}
              </p>
              <div className="flex items-center gap-3">
                {deal.experts.map((expert) => (
                  <HoverCard key={expert.nameKey}>
                    <HoverCardTrigger asChild>
                      <Avatar
                        src={AVATAR_URL(expert.seed)}
                        alt={d[expert.nameKey]}
                        fallback={d[expert.nameKey].slice(0, 2)}
                        size="lg"
                        className="hover:ring-brand cursor-pointer ring-offset-2 transition-shadow hover:ring-2"
                      />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={AVATAR_URL(expert.seed)}
                          alt={d[expert.nameKey]}
                          fallback={d[expert.nameKey].slice(0, 2)}
                          size="md"
                        />
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <p className="text-fg text-sm font-semibold">
                            {d[expert.nameKey]}
                          </p>
                          <p className="text-brand text-xs font-medium">
                            {d[expert.roleKey]}
                          </p>
                          <p className="text-muted text-xs leading-relaxed">
                            {d[expert.lineKey]}
                          </p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
