"use client";

import Image from "next/image";
import { IconShoppingCart } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShoppingCartMessages } from "@/types/pages/shopping-cart/ShoppingCartMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Cart3Item {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
  imageSeed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const ITEMS: Cart3Item[] = [
  {
    id: "mug",
    nameKey: "shoppingCart3Item1Name",
    price: 15,
    qty: 2,
    imageSeed: "cart3-mug",
  },
  {
    id: "charger",
    nameKey: "shoppingCart3Item2Name",
    price: 29,
    qty: 1,
    imageSeed: "cart3-charger",
  },
  {
    id: "notebook",
    nameKey: "shoppingCart3Item3Name",
    price: 12,
    qty: 1,
    imageSeed: "cart3-notebook",
  },
];

export function MiniCartPopoverShoppingCart() {
  const t = useMessages("pages") as unknown as PagesWithShoppingCartMessages;
  const sc = t.shoppingCart;
  const itemCount = ITEMS.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = ITEMS.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-surface mx-auto flex max-w-6xl items-center justify-between rounded-xl border px-6 py-4 lg:px-8">
        <span className="text-fg text-sm font-semibold">
          {sc.shoppingCart3HeaderBrand}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={sc.shoppingCart3TriggerLabel}
            >
              <IconShoppingCart size={20} aria-hidden="true" />
              <Badge
                variant="error"
                pill
                size="sm"
                className="absolute -top-1 -right-1 size-5 min-w-5 justify-center p-0 text-[10px] font-semibold"
              >
                {itemCount}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(92vw,20rem)]"
            align="end"
            sideOffset={10}
            title={sc.shoppingCart3Heading}
          >
            <div className="flex flex-col gap-4">
              <Typography variant="h3" className="text-base font-semibold">
                {sc.shoppingCart3Heading}
              </Typography>
              <ul className="flex flex-col gap-3">
                {ITEMS.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="bg-surface-hover relative size-11 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={placeholderImage(item.imageSeed, "1x1")}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-fg truncate text-sm font-medium">
                        {sc[item.nameKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {sc.shoppingCart3QtyTemplate.replace(
                          "{qty}",
                          String(item.qty),
                        )}
                      </span>
                    </div>
                    <span className="text-fg text-sm font-medium">
                      {usd(item.qty * item.price)}
                    </span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-fg">{sc.shoppingCart3SubtotalLabel}</span>
                <span className="text-fg">{usd(subtotal)}</span>
              </div>
              <p className="text-muted text-xs">{sc.shoppingCart3FooterNote}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  {sc.shoppingCart3ViewCartLabel}
                </Button>
                <Button variant="primary" className="flex-1">
                  {sc.shoppingCart3CheckoutLabel}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
}
