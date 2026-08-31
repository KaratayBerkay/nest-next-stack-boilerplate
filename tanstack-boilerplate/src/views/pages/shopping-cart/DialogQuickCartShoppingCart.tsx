"use client";

import { useState } from "react";
import Image from "next/image";
import { IconShoppingCart, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Counter } from "@/components/ui/Counter";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Cart7Item {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
  imageSeed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const INITIAL_ITEMS: Cart7Item[] = [
  {
    id: "desk-organizer",
    nameKey: "shoppingCart7Item1Name",
    price: 32,
    qty: 1,
    imageSeed: "cart7-organizer",
  },
  {
    id: "mousepad",
    nameKey: "shoppingCart7Item2Name",
    price: 19,
    qty: 1,
    imageSeed: "cart7-mousepad",
  },
  {
    id: "cable-tray",
    nameKey: "shoppingCart7Item3Name",
    price: 27,
    qty: 2,
    imageSeed: "cart7-cabletray",
  },
  {
    id: "monitor-stand",
    nameKey: "shoppingCart7Item4Name",
    price: 45,
    qty: 1,
    imageSeed: "cart7-monitorstand",
  },
];

export function DialogQuickCartShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const [items, setItems] = useState<Cart7Item[]>(INITIAL_ITEMS);

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Dialog>
          <DialogTrigger
            variant="primary"
            className="relative inline-flex items-center gap-2"
          >
            <IconShoppingCart size={18} aria-hidden="true" />
            {sc.shoppingCart7TriggerLabel}
            <Badge
              variant="secondary"
              pill
              size="sm"
              className="ml-1 min-w-5 justify-center px-1.5"
            >
              {items.length}
            </Badge>
          </DialogTrigger>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>{sc.shoppingCart7Heading}</DialogTitle>
              <DialogDescription>
                {sc.shoppingCart7Description}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              {items.length === 0 ? (
                <p className="text-muted text-sm">
                  {sc.shoppingCart7EmptyLabel}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border-border relative flex flex-col gap-3 rounded-xl border p-3"
                    >
                      <button
                        type="button"
                        aria-label={sc.shoppingCart7RemoveLabel}
                        onClick={() => removeItem(item.id)}
                        className="text-muted hover:bg-surface-hover hover:text-fg absolute top-2 right-2 z-10 inline-flex size-7 items-center justify-center rounded-md transition-colors"
                      >
                        <IconX size={14} aria-hidden="true" />
                      </button>
                      <div className="bg-surface-hover relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                        <Image
                          src={placeholderImage(item.imageSeed, "4x3")}
                          alt=""
                          fill
                          sizes="240px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div>
                          <p className="text-fg text-sm font-medium">
                            {sc[item.nameKey]}
                          </p>
                          <p className="text-muted text-xs">
                            {usd(item.price)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <Counter
                            label={sc.shoppingCart7QuantityAriaTemplate.replace(
                              "{name}",
                              sc[item.nameKey],
                            )}
                            min={1}
                            max={9}
                            value={item.qty}
                            onChange={(qty) => updateQty(item.id, qty)}
                          />
                          <span className="text-fg text-sm font-semibold">
                            {usd(item.qty * item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <div className="flex w-full flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
                <span className="text-fg text-base font-semibold">
                  {sc.shoppingCart7TotalLabel} {usd(total)}
                </span>
                <div className="flex gap-2">
                  <DialogClose variant="ghost">
                    {sc.shoppingCart7ContinueShoppingLabel}
                  </DialogClose>
                  <DialogClose variant="primary">
                    {sc.shoppingCart7CheckoutLabel}
                  </DialogClose>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
