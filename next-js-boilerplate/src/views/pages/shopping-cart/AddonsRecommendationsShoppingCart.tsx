"use client";

import { useState } from "react";
import Image from "next/image";
import { IconPlus, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Counter } from "@/components/ui/Counter";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Cart5BaseItem {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
}

interface Cart5Addon {
  id: string;
  nameKey: string;
  blurbKey: string;
  price: number;
  imageSeed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const BASE_ITEMS: Cart5BaseItem[] = [
  { id: "camera", nameKey: "shoppingCart5Item1Name", price: 129, qty: 1 },
  { id: "tripod", nameKey: "shoppingCart5Item2Name", price: 39, qty: 1 },
];

const ADDONS: Cart5Addon[] = [
  {
    id: "case",
    nameKey: "shoppingCart5Addon1Name",
    blurbKey: "shoppingCart5Addon1Blurb",
    price: 24,
    imageSeed: "cart5-case",
  },
  {
    id: "card",
    nameKey: "shoppingCart5Addon2Name",
    blurbKey: "shoppingCart5Addon2Blurb",
    price: 18,
    imageSeed: "cart5-card",
  },
  {
    id: "strap",
    nameKey: "shoppingCart5Addon3Name",
    blurbKey: "shoppingCart5Addon3Blurb",
    price: 15,
    imageSeed: "cart5-strap",
  },
];

export function AddonsRecommendationsShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const [items, setItems] = useState<Cart5BaseItem[]>(BASE_ITEMS);
  const [addedAddons, setAddedAddons] = useState<Set<string>>(new Set());

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  };

  const toggleAddon = (addon: Cart5Addon) => {
    setAddedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(addon.id)) next.delete(addon.id);
      else next.add(addon.id);
      return next;
    });
  };

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const addonsTotal = ADDONS.filter((addon) =>
    addedAddons.has(addon.id),
  ).reduce((sum, addon) => sum + addon.price, 0);
  const total = subtotal + addonsTotal;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sc.shoppingCart5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sc.shoppingCart5Intro}</p>
        </div>

        <ul className="border-border divide-border divide-y rounded-xl border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-fg text-sm font-medium">
                  {sc[item.nameKey]}
                </span>
                <span className="text-muted text-xs">{usd(item.price)}</span>
              </div>
              <Counter
                label={sc.shoppingCart5QuantityAriaTemplate.replace(
                  "{name}",
                  sc[item.nameKey],
                )}
                min={1}
                max={9}
                value={item.qty}
                onChange={(qty) => updateQty(item.id, qty)}
              />
              <span className="text-fg w-16 shrink-0 text-right text-sm font-semibold">
                {usd(item.qty * item.price)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4">
          <h3 className="text-fg text-lg font-semibold">
            {sc.shoppingCart5AddonsHeading}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ADDONS.map((addon) => {
              const isAdded = addedAddons.has(addon.id);
              return (
                <Card key={addon.id} variant={isAdded ? "elevated" : "default"}>
                  <div className="flex flex-col gap-3 p-4">
                    <div className="bg-surface-hover relative aspect-square w-full overflow-hidden rounded-lg">
                      <Image
                        src={placeholderImage(addon.imageSeed, "1x1")}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-fg text-sm font-medium">
                        {sc[addon.nameKey]}
                      </p>
                      <p className="text-muted text-xs leading-relaxed">
                        {sc[addon.blurbKey]}
                      </p>
                      <p className="text-fg mt-1 text-sm font-semibold">
                        {usd(addon.price)}
                      </p>
                    </div>
                    <Button
                      variant={isAdded ? "soft" : "outline"}
                      size="sm"
                      leftIcon={
                        isAdded ? (
                          <IconCheck size={14} aria-hidden="true" />
                        ) : (
                          <IconPlus size={14} aria-hidden="true" />
                        )
                      }
                      onClick={() => toggleAddon(addon)}
                      className="w-full"
                    >
                      {isAdded
                        ? sc.shoppingCart5AddedLabel
                        : sc.shoppingCart5AddLabel}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">{sc.shoppingCart5SubtotalLabel}</span>
            <span className="text-fg">{usd(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">
              {sc.shoppingCart5AddonsTotalLabel}
            </span>
            <span className="text-fg">{usd(addonsTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span className="text-fg">{sc.shoppingCart5TotalLabel}</span>
            <span className="text-fg">{usd(total)}</span>
          </div>
          <Button
            variant="primary"
            className="mt-2 w-full sm:w-fit sm:self-end"
          >
            {sc.shoppingCart5CheckoutLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
