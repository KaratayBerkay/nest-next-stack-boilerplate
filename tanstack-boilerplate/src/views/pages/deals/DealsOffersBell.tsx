"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconBellRinging,
  IconBolt,
  IconChevronRight,
  IconDiscount,
  IconGift,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

type DealsMessages = Record<string, string>;

interface PagesWithDealsMessages {
  deals: DealsMessages;
}

type OfferId = "firstMonth" | "onboarding" | "annual";

interface OfferRow {
  id: OfferId;
  icon: typeof IconGift;
  titleKey: string;
  descriptionKey: string;
  expiryKey: string;
  ctaKey: string;
}

const LINK_URL = "#" as const;

const OFFERS: OfferRow[] = [
  {
    id: "firstMonth",
    icon: IconGift,
    titleKey: "deals7Offer1Title",
    descriptionKey: "deals7Offer1Description",
    expiryKey: "deals7Offer1Expiry",
    ctaKey: "deals7Offer1Cta",
  },
  {
    id: "onboarding",
    icon: IconDiscount,
    titleKey: "deals7Offer2Title",
    descriptionKey: "deals7Offer2Description",
    expiryKey: "deals7Offer2Expiry",
    ctaKey: "deals7Offer2Cta",
  },
  {
    id: "annual",
    icon: IconBolt,
    titleKey: "deals7Offer3Title",
    descriptionKey: "deals7Offer3Description",
    expiryKey: "deals7Offer3Expiry",
    ctaKey: "deals7Offer3Cta",
  },
];

function handleDismissOffer(
  offerId: OfferId,
  setDismissed: Dispatch<SetStateAction<Set<OfferId>>>,
) {
  setDismissed((prev) => {
    const next = new Set(prev);
    next.add(offerId);
    return next;
  });
}

export function DealsOffersBell() {
  const t = useMessages("pages") as unknown as PagesWithDealsMessages;
  const d = t.deals;
  const [dismissed, setDismissed] = useState<Set<OfferId>>(new Set());
  const visibleOffers = OFFERS.filter((offer) => !dismissed.has(offer.id));

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="primary"
            className="relative size-12 rounded-full shadow-lg"
            aria-label={d.deals7TriggerLabel}
          >
            <IconBellRinging size={22} />
            <span className="absolute -top-0.5 -right-0.5">
              <span className="bg-brand absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
              <span className="bg-brand relative inline-flex size-2.5 rounded-full" />
            </span>
            <Badge
              variant="error"
              pill
              size="sm"
              className="absolute -top-1 -right-1 size-5 min-w-5 justify-center p-0 text-[10px] font-semibold"
            >
              {d.deals7BadgeCount}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(92vw,22rem)]"
          align="start"
          sideOffset={12}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Typography
                variant="h3"
                className="text-lg font-semibold tracking-tight"
              >
                {d.deals7Heading}
              </Typography>
              <Typography variant="body" className="text-muted text-sm">
                {d.deals7Description}
              </Typography>
            </div>

            {visibleOffers.length === 0 ? (
              <div className="bg-surface border-border flex flex-col gap-1 rounded-xl border p-5">
                <p className="text-fg text-sm font-semibold">
                  {d.deals7EmptyTitle}
                </p>
                <p className="text-muted text-xs leading-relaxed">
                  {d.deals7EmptyDescription}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {visibleOffers.map((offer) => {
                  const OfferIcon = offer.icon;
                  return (
                    <li
                      key={offer.id}
                      className="border-border bg-surface flex items-start gap-3 rounded-xl border p-3"
                    >
                      <span className="border-border bg-surface-hover/50 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg border">
                        <OfferIcon size={20} />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="text-fg text-sm font-semibold">
                          {d[offer.titleKey]}
                        </p>
                        <p className="text-muted text-xs leading-relaxed">
                          {d[offer.descriptionKey]}
                        </p>
                        <p className="text-brand mt-0.5 text-xs font-medium">
                          {d[offer.expiryKey]}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            rightIcon={<IconChevronRight size={14} />}
                          >
                            {d[offer.ctaKey]}
                          </Button>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={d.deals7DismissLabel}
                        onClick={() =>
                          handleDismissOffer(offer.id, setDismissed)
                        }
                        className="text-muted hover:bg-surface-hover hover:text-fg flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
                      >
                        <IconX size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <a
              href={LINK_URL}
              className="text-brand flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              {d.deals7ViewAll}
            </a>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
