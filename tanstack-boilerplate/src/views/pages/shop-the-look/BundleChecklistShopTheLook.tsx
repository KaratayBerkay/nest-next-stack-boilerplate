"use client";

import { useState } from "react";
import Image from "next/image";
import { IconPlus, IconShoppingBag } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithShopTheLookMessages } from "@/types/pages/shop-the-look/ShopTheLookMessages-types";

const usd = (n: number) => `$${n.toFixed(2)}`;
const BUNDLE_DISCOUNT = 0.9;

interface BundleItem {
  id: string;
  nameKey: string;
  price: number;
  seed: string;
}

const BUNDLE_ITEMS: BundleItem[] = [
  { id: "sweater", nameKey: "shopTheLook3Item1Name", price: 78, seed: "stl3-sweater" },
  { id: "trousers", nameKey: "shopTheLook3Item2Name", price: 92, seed: "stl3-trousers" },
  { id: "scarf", nameKey: "shopTheLook3Item3Name", price: 34, seed: "stl3-scarf" },
];

const DEFAULT_CHECKED: Record<string, boolean> = {
  sweater: true,
  trousers: true,
  scarf: true,
};

export function BundleChecklistShopTheLook() {
  const t = useMessages("pages") as unknown as PagesWithShopTheLookMessages;
  const stl = t.shopTheLook;
  const [checked, setChecked] = useState<Record<string, boolean>>(DEFAULT_CHECKED);

  const selectedItems = BUNDLE_ITEMS.filter((item) => checked[item.id]);
  const originalTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const bundleTotal = originalTotal * BUNDLE_DISCOUNT;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {stl.shopTheLook3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {stl.shopTheLook3Heading}
          </h2>
          <p className="text-muted">{stl.shopTheLook3Description}</p>
        </div>

        <div className="border-border bg-surface mt-10 flex flex-col gap-6 rounded-3xl border p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap">
            {BUNDLE_ITEMS.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-surface-hover border-border relative size-28 overflow-hidden rounded-2xl border sm:size-32">
                    <Image
                      src={placeholderImage(item.seed, "1x1")}
                      alt={stl[item.nameKey]}
                      fill
                      sizes="128px"
                      className={cn(
                        "object-cover transition-opacity",
                        !checked[item.id] && "opacity-40",
                      )}
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={checked[item.id] ?? false}
                      onChange={() =>
                        setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      aria-label={`${stl.shopTheLook3CheckboxAriaPrefix} ${stl[item.nameKey]}`}
                      className="shadow-sm"
                    />
                  </div>
                  <span className="text-fg mt-2 block text-center text-sm font-medium">
                    {stl[item.nameKey]}
                  </span>
                  <span className="text-muted block text-center text-xs">
                    {usd(item.price)}
                  </span>
                </div>
                {index < BUNDLE_ITEMS.length - 1 && (
                  <IconPlus
                    size={18}
                    className="text-muted shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="border-border flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="soft" size="sm">
                {selectedItems.length}
              </Badge>
              <span className="text-muted text-sm">
                {stl.shopTheLook3SelectedCountLabel}
              </span>
              <Badge variant="success" size="sm">
                {stl.shopTheLook3SaveBadge}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-muted text-xs">
                  {stl.shopTheLook3OriginalTotalLabel}
                </span>
                <span className="text-muted text-sm line-through">
                  {usd(originalTotal)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted text-xs">
                  {stl.shopTheLook3BundleTotalLabel}
                </span>
                <span className="text-fg text-xl font-semibold tracking-tight">
                  {usd(bundleTotal)}
                </span>
              </div>
              <Button
                variant="primary"
                leftIcon={<IconShoppingBag size={16} />}
                disabled={selectedItems.length === 0}
              >
                {stl.shopTheLook3AddBundleLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
