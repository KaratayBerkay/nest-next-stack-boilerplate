"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconCheck, IconClock, IconShoppingBag } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

const ADDED_TIMEOUT_MS = 1800;
// Demo-only sale end: ~3h20m out from whenever this block mounts, computed
// inside the effect (client-only) so it never leaks into the initial render
// output — mirrors the promo-banner countdown pattern used elsewhere.
const SALE_OFFSET_SECONDS = 3 * 3600 + 20 * 60;

interface Remaining {
  hours: number;
  minutes: number;
  seconds: number;
}

interface SaleItem {
  id: string;
  nameKey: string;
  originalPriceKey: string;
  salePriceKey: string;
  discountPercent: number;
  seed: string;
}

const ITEMS: SaleItem[] = [
  {
    id: "pulse-smartwatch",
    nameKey: "productCard5Product1Name",
    originalPriceKey: "productCard5Product1OriginalPrice",
    salePriceKey: "productCard5Product1SalePrice",
    discountPercent: 30,
    seed: "product-card-5-smartwatch",
  },
  {
    id: "summit-daypack",
    nameKey: "productCard5Product2Name",
    originalPriceKey: "productCard5Product2OriginalPrice",
    salePriceKey: "productCard5Product2SalePrice",
    discountPercent: 25,
    seed: "product-card-5-daypack",
  },
  {
    id: "horizon-sunglasses",
    nameKey: "productCard5Product3Name",
    originalPriceKey: "productCard5Product3OriginalPrice",
    salePriceKey: "productCard5Product3SalePrice",
    discountPercent: 40,
    seed: "product-card-5-sunglasses",
  },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function DiscountRibbonCountdownProductCard() {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    const target = Date.now() + SALE_OFFSET_SECONDS * 1000;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1_000) % 60),
      });
    };
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  function handleAddToCart(id: string) {
    setAddedId(id);
    setTimeout(() => {
      setAddedId((current) => (current === id ? null : current));
    }, ADDED_TIMEOUT_MS);
  }

  const countdownText = remaining
    ? `${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(remaining.seconds)}`
    : "--:--:--";

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {p.productCard5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.productCard5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{p.productCard5Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => {
            const name = p[item.nameKey];
            const isAdded = addedId === item.id;
            return (
              <Card key={item.id} variant="default">
                <div className="flex flex-col">
                  <div className="bg-surface relative aspect-[4/3] overflow-hidden rounded-t-xl">
                    <Image
                      src={placeholderImage(item.seed, "4x3")}
                      alt={name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
                      className="object-cover"
                    />
                    <Badge
                      variant="error"
                      size="sm"
                      className="absolute top-3 left-3"
                    >
                      {p.productCard5DiscountBadgeTemplate.replace(
                        "{percent}",
                        String(item.discountPercent),
                      )}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2.5 p-4">
                    <span className="text-fg text-sm font-medium">{name}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-fg text-base font-semibold tracking-tight">
                        {p[item.salePriceKey]}
                      </span>
                      <span className="text-muted text-sm line-through">
                        {p[item.originalPriceKey]}
                      </span>
                    </div>
                    <div
                      className="text-muted flex items-center gap-1.5 text-xs"
                      suppressHydrationWarning
                    >
                      <IconClock size={13} aria-hidden="true" />
                      <span>{p.productCard5SaleEndsLabel}</span>
                      <span className="text-fg font-medium tabular-nums">
                        {countdownText}
                      </span>
                    </div>
                    <Button
                      variant={isAdded ? "soft" : "primary"}
                      size="sm"
                      className="mt-1 w-full"
                      onClick={() => handleAddToCart(item.id)}
                    >
                      {isAdded ? (
                        <>
                          <IconCheck size={14} aria-hidden="true" />
                          {p.productCard5AddedLabel}
                        </>
                      ) : (
                        <>
                          <IconShoppingBag size={14} aria-hidden="true" />
                          {p.productCard5AddToCartLabel}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
