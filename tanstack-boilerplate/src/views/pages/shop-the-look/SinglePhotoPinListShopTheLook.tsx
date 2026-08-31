"use client";

import Image from "next/image";
import { IconShoppingBag } from "@tabler/icons-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithShopTheLookMessages } from "@/types/pages/shop-the-look/ShopTheLookMessages-types";

const usd = (n: number) => `$${n.toFixed(2)}`;

interface PinnedProduct {
  id: string;
  number: number;
  nameKey: string;
  price: number;
  seed: string;
  top: string;
  left: string;
}

const PRODUCTS: PinnedProduct[] = [
  {
    id: "jacket",
    number: 1,
    nameKey: "shopTheLook1Product1Name",
    price: 168,
    seed: "stl1-jacket",
    top: "20%",
    left: "40%",
  },
  {
    id: "bag",
    number: 2,
    nameKey: "shopTheLook1Product2Name",
    price: 96,
    seed: "stl1-bag",
    top: "46%",
    left: "70%",
  },
  {
    id: "boots",
    number: 3,
    nameKey: "shopTheLook1Product3Name",
    price: 142,
    seed: "stl1-boots",
    top: "84%",
    left: "44%",
  },
  {
    id: "belt",
    number: 4,
    nameKey: "shopTheLook1Product4Name",
    price: 38,
    seed: "stl1-belt",
    top: "56%",
    left: "24%",
  },
];

export function SinglePhotoPinListShopTheLook() {
  const t = useMessages("pages") as unknown as PagesWithShopTheLookMessages;
  const stl = t.shopTheLook;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {stl.shopTheLook1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {stl.shopTheLook1Heading}
          </h2>
          <p className="text-muted">{stl.shopTheLook1Description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="border-border bg-surface relative aspect-[3/4] overflow-hidden rounded-3xl border">
            <Image
              src={placeholderImage("stl1-hero", "3x4")}
              alt={stl.shopTheLook1PhotoAlt}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            {PRODUCTS.map((product) => (
              // Wrapper div owns position + the circular clip; the trigger
              // itself is left un-rounded so its baked-in `rounded` class
              // (cn() here is a plain join, not tailwind-merge — it cannot
              // be relied on to let a later `rounded-full` win) never has to
              // fight ours. `overflow-hidden` on the wrapper does the clipping.
              <div
                key={product.id}
                style={{ top: product.top, left: product.left }}
                className="border-border absolute size-8 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border shadow-md"
              >
                <Popover>
                  <PopoverTrigger
                    aria-label={`${stl.shopTheLook1PinAriaPrefix} ${stl[product.nameKey]}`}
                    className="bg-bg/90 text-fg data-[state=open]:bg-brand data-[state=open]:text-brand-fg size-full items-center justify-center text-xs backdrop-blur-sm transition-colors"
                  >
                    {/* font-semibold lives on this span, not the trigger
                        itself — the trigger already bakes in font-medium,
                        and a child's own weight simply wins by inheritance
                        instead of fighting that class for specificity. */}
                    <span className="font-semibold">{product.number}</span>
                  </PopoverTrigger>
                  <PopoverContent
                    title={stl[product.nameKey]}
                    align="start"
                    sideOffset={10}
                    className="w-64"
                  >
                    <div className="flex gap-3">
                      <div className="bg-surface-hover relative size-16 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={placeholderImage(product.seed, "1x1")}
                          alt={stl[product.nameKey]}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-fg text-sm font-medium">
                          {stl[product.nameKey]}
                        </span>
                        <span className="text-fg text-sm font-semibold">
                          {usd(product.price)}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<IconShoppingBag size={14} />}
                          className="mt-1 w-full"
                        >
                          {stl.shopTheLook1AddToBagLabel}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
              {stl.shopTheLook1ListHeading}
            </h3>
            <ul className="flex flex-col gap-3">
              {PRODUCTS.map((product) => (
                <li
                  key={product.id}
                  className="border-border bg-surface flex items-center gap-3 rounded-2xl border p-3"
                >
                  <span className="border-border text-muted flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                    {product.number}
                  </span>
                  <div className="bg-surface-hover relative size-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={placeholderImage(product.seed, "1x1")}
                      alt={stl[product.nameKey]}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-fg min-w-0 flex-1 truncate text-sm font-medium">
                    {stl[product.nameKey]}
                  </span>
                  <span className="text-fg text-sm font-semibold">
                    {usd(product.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
