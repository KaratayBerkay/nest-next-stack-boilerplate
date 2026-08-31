"use client";

import { useState } from "react";
import { IconTruck, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/Drawer";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";

interface Cart8Item {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING = 5.5 as const;

const INITIAL_ITEMS: Cart8Item[] = [
  { id: "planter", nameKey: "shoppingCart8Item1Name", price: 24, qty: 1 },
  { id: "watering-can", nameKey: "shoppingCart8Item2Name", price: 19, qty: 1 },
  { id: "trowel", nameKey: "shoppingCart8Item3Name", price: 12, qty: 2 },
];

export function ShippingProgressDrawerShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const [items, setItems] = useState<Cart8Item[]>(INITIAL_ITEMS);

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const unlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = items.length === 0 ? 0 : unlocked ? 0 : SHIPPING;
  const total = subtotal + shipping;
  const progressPct = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              leftIcon={<IconTruck size={18} aria-hidden="true" />}
            >
              {sc.shoppingCart8TriggerLabel}
              <Badge variant="soft" size="sm" pill className="ml-1">
                {items.length}
              </Badge>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="mx-auto w-full max-w-lg">
            <DrawerHeader className="text-left">
              <DrawerTitle>{sc.shoppingCart8Heading}</DrawerTitle>
              <DrawerDescription>
                {sc.shoppingCart8Description}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-2 px-1 pb-4">
              <Progress value={progressPct} size="sm" />
              <p className="text-muted text-xs">
                {unlocked
                  ? sc.shoppingCart8ProgressUnlockedLabel
                  : sc.shoppingCart8ProgressRemainingTemplate.replace(
                      "{amount}",
                      usd(remaining),
                    )}
              </p>
            </div>

            {items.length === 0 ? (
              <p className="text-muted px-1 pb-4 text-sm">
                {sc.shoppingCart8EmptyLabel}
              </p>
            ) : (
              <ul className="flex flex-col gap-3 px-1 pb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-fg truncate text-sm font-medium">
                        {sc[item.nameKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {usd(item.price)}
                      </span>
                    </div>
                    <Counter
                      label={sc.shoppingCart8QuantityAriaTemplate.replace(
                        "{name}",
                        sc[item.nameKey],
                      )}
                      min={1}
                      max={9}
                      value={item.qty}
                      onChange={(qty) => updateQty(item.id, qty)}
                    />
                    <IconButton
                      icon={<IconX size={14} aria-hidden="true" />}
                      label={sc.shoppingCart8RemoveLabel}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                    />
                  </li>
                ))}
              </ul>
            )}

            <DrawerFooter>
              <div className="flex w-full flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {sc.shoppingCart8SubtotalLabel}
                  </span>
                  <span className="text-fg">{usd(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {sc.shoppingCart8ShippingLabel}
                  </span>
                  <span className="text-fg">{usd(shipping)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span className="text-fg">{sc.shoppingCart8TotalLabel}</span>
                  <span className="text-fg">{usd(total)}</span>
                </div>
                <Button variant="primary" className="mt-2 w-full">
                  {sc.shoppingCart8CheckoutLabel}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </section>
  );
}
