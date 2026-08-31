"use client";

import { useState } from "react";
import Image from "next/image";
import { IconTrash } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Empty } from "@/components/ui/Empty";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Cart1Item {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
  imageSeed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const INITIAL_ITEMS: Cart1Item[] = [
  {
    id: "headphones",
    nameKey: "shoppingCart1Item1Name",
    price: 89,
    qty: 1,
    imageSeed: "cart1-headphones",
  },
  {
    id: "tote",
    nameKey: "shoppingCart1Item2Name",
    price: 34,
    qty: 2,
    imageSeed: "cart1-tote",
  },
  {
    id: "lamp",
    nameKey: "shoppingCart1Item3Name",
    price: 52,
    qty: 1,
    imageSeed: "cart1-lamp",
  },
  {
    id: "journal",
    nameKey: "shoppingCart1Item4Name",
    price: 16,
    qty: 3,
    imageSeed: "cart1-journal",
  },
];

const SHIPPING = 6.5 as const;
const TAX_RATE = 0.08;

export function QuantityTableShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const [items, setItems] = useState<Cart1Item[]>(INITIAL_ITEMS);

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = items.length > 0 ? SHIPPING : 0;
  const total = subtotal + tax + shipping;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {sc.shoppingCart1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{sc.shoppingCart1Intro}</p>
        </div>

        {items.length === 0 ? (
          <Empty
            title={sc.shoppingCart1EmptyTitle}
            description={sc.shoppingCart1EmptyDescription}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{sc.shoppingCart1ColProduct}</TableHead>
                  <TableHead>{sc.shoppingCart1ColPrice}</TableHead>
                  <TableHead>{sc.shoppingCart1ColQuantity}</TableHead>
                  <TableHead>{sc.shoppingCart1ColTotal}</TableHead>
                  <TableHead>
                    <span className="sr-only">{sc.shoppingCart1ColRemove}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-hover relative size-12 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={placeholderImage(item.imageSeed, "1x1")}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <span className="text-fg font-medium">
                          {sc[item.nameKey]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted">
                      {usd(item.price)}
                    </TableCell>
                    <TableCell>
                      <Counter
                        label={sc[item.nameKey]}
                        min={1}
                        max={9}
                        value={item.qty}
                        onChange={(qty) => updateQty(item.id, qty)}
                      />
                    </TableCell>
                    <TableCell className="text-fg font-medium">
                      {usd(item.qty * item.price)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        icon={<IconTrash size={16} aria-hidden="true" />}
                        label={sc.shoppingCart1RemoveLabel}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <div className="flex w-full max-w-sm flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">
                    {sc.shoppingCart1SubtotalLabel}
                  </span>
                  <span className="text-fg">{usd(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">
                    {sc.shoppingCart1ShippingLabel}
                  </span>
                  <span className="text-fg">{usd(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{sc.shoppingCart1TaxLabel}</span>
                  <span className="text-fg">{usd(tax)}</span>
                </div>
                <div className="border-border flex items-center justify-between border-t pt-2 text-base font-semibold">
                  <span className="text-fg">{sc.shoppingCart1TotalLabel}</span>
                  <span className="text-fg">{usd(total)}</span>
                </div>
                <Button variant="primary" className="mt-2 w-full">
                  {sc.shoppingCart1CheckoutLabel}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
