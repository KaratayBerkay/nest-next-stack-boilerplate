"use client";

import { useState } from "react";
import Image from "next/image";
import { IconShoppingBag } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithShopTheLookMessages } from "@/types/pages/shop-the-look/ShopTheLookMessages-types";

const usd = (n: number) => `$${n.toFixed(2)}`;

interface OutfitOption {
  id: string;
  nameKey: string;
  price: number;
  seed: string;
}

interface OutfitSlot {
  id: string;
  labelKey: string;
  options: OutfitOption[];
}

const SLOTS: OutfitSlot[] = [
  {
    id: "top",
    labelKey: "shopTheLook2SlotTopLabel",
    options: [
      {
        id: "top-1",
        nameKey: "shopTheLook2TopOption1Name",
        price: 88,
        seed: "stl2-top-1",
      },
      {
        id: "top-2",
        nameKey: "shopTheLook2TopOption2Name",
        price: 96,
        seed: "stl2-top-2",
      },
      {
        id: "top-3",
        nameKey: "shopTheLook2TopOption3Name",
        price: 104,
        seed: "stl2-top-3",
      },
    ],
  },
  {
    id: "footwear",
    labelKey: "shopTheLook2SlotFootwearLabel",
    options: [
      {
        id: "footwear-1",
        nameKey: "shopTheLook2FootwearOption1Name",
        price: 128,
        seed: "stl2-shoe-1",
      },
      {
        id: "footwear-2",
        nameKey: "shopTheLook2FootwearOption2Name",
        price: 142,
        seed: "stl2-shoe-2",
      },
      {
        id: "footwear-3",
        nameKey: "shopTheLook2FootwearOption3Name",
        price: 118,
        seed: "stl2-shoe-3",
      },
    ],
  },
  {
    id: "accessory",
    labelKey: "shopTheLook2SlotAccessoryLabel",
    options: [
      {
        id: "accessory-1",
        nameKey: "shopTheLook2AccessoryOption1Name",
        price: 42,
        seed: "stl2-acc-1",
      },
      {
        id: "accessory-2",
        nameKey: "shopTheLook2AccessoryOption2Name",
        price: 54,
        seed: "stl2-acc-2",
      },
      {
        id: "accessory-3",
        nameKey: "shopTheLook2AccessoryOption3Name",
        price: 36,
        seed: "stl2-acc-3",
      },
    ],
  },
];

const DEFAULT_SELECTION: Record<string, string> = {
  top: "top-1",
  footwear: "footwear-1",
  accessory: "accessory-1",
};

export function OutfitBuilderVariantsShopTheLook() {
  const t = useMessages("pages") as unknown as PagesWithShopTheLookMessages;
  const stl = t.shopTheLook;
  const [selected, setSelected] =
    useState<Record<string, string>>(DEFAULT_SELECTION);

  const chosen = SLOTS.map((slot) => ({
    slot,
    option:
      slot.options.find((o) => o.id === selected[slot.id]) ?? slot.options[0],
  }));
  const total = chosen.reduce((sum, { option }) => sum + option.price, 0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {stl.shopTheLook2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {stl.shopTheLook2Heading}
          </h2>
          <p className="text-muted">{stl.shopTheLook2Description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-6">
            {SLOTS.map((slot) => (
              <div key={slot.id} className="flex flex-col gap-3">
                <span className="text-fg text-sm font-semibold">
                  {stl[slot.labelKey]}
                </span>
                <div className="flex flex-wrap gap-3">
                  {slot.options.map((option) => {
                    const isActive = selected[slot.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-label={`${stl.shopTheLook2SwatchAriaPrefix} ${stl[option.nameKey]}`}
                        aria-pressed={isActive}
                        onClick={() =>
                          setSelected((prev) => ({
                            ...prev,
                            [slot.id]: option.id,
                          }))
                        }
                        className={cn(
                          "relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                          isActive
                            ? "border-brand"
                            : "border-border hover:border-brand/50",
                        )}
                      >
                        <Image
                          src={placeholderImage(option.seed, "1x1")}
                          alt={stl[option.nameKey]}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-border bg-surface flex h-fit flex-col gap-4 rounded-3xl border p-6">
            <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
              {stl.shopTheLook2PreviewHeading}
            </h3>
            <div className="flex flex-col gap-3">
              {chosen.map(({ slot, option }) => (
                <div key={slot.id} className="flex items-center gap-3">
                  <div className="bg-surface-hover relative size-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={placeholderImage(option.seed, "1x1")}
                      alt={stl[option.nameKey]}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-fg min-w-0 flex-1 truncate text-sm font-medium">
                    {stl[option.nameKey]}
                  </span>
                  <span className="text-fg text-sm font-semibold">
                    {usd(option.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-border flex items-center justify-between border-t pt-4">
              <span className="text-fg text-base font-semibold">
                {stl.shopTheLook2TotalLabel}
              </span>
              <span className="text-fg text-xl font-semibold tracking-tight">
                {usd(total)}
              </span>
            </div>
            <Button
              variant="primary"
              leftIcon={<IconShoppingBag size={16} />}
              className="w-full"
            >
              {stl.shopTheLook2AddToBagLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
