"use client";

import Image from "next/image";
import { IconPlus, IconShoppingBag } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithShopTheLookMessages } from "@/types/pages/shop-the-look/ShopTheLookMessages-types";

const usd = (n: number) => `$${n.toFixed(2)}`;

interface LookPin {
  id: string;
  nameKey: string;
  price: number;
  top: string;
  left: string;
}

interface CreatorLook {
  id: string;
  creatorNameKey: string;
  seed: string;
  pins: LookPin[];
}

const LOOKS: CreatorLook[] = [
  {
    id: "look-1",
    creatorNameKey: "shopTheLook5Look1CreatorName",
    seed: "stl5-look-1",
    pins: [
      {
        id: "look1-pin1",
        nameKey: "shopTheLook5Look1Pin1Name",
        price: 74,
        top: "30%",
        left: "44%",
      },
      {
        id: "look1-pin2",
        nameKey: "shopTheLook5Look1Pin2Name",
        price: 118,
        top: "72%",
        left: "58%",
      },
    ],
  },
  {
    id: "look-2",
    creatorNameKey: "shopTheLook5Look2CreatorName",
    seed: "stl5-look-2",
    pins: [
      {
        id: "look2-pin1",
        nameKey: "shopTheLook5Look2Pin1Name",
        price: 56,
        top: "26%",
        left: "36%",
      },
      {
        id: "look2-pin2",
        nameKey: "shopTheLook5Look2Pin2Name",
        price: 132,
        top: "68%",
        left: "52%",
      },
    ],
  },
  {
    id: "look-3",
    creatorNameKey: "shopTheLook5Look3CreatorName",
    seed: "stl5-look-3",
    pins: [
      {
        id: "look3-pin1",
        nameKey: "shopTheLook5Look3Pin1Name",
        price: 88,
        top: "34%",
        left: "48%",
      },
      {
        id: "look3-pin2",
        nameKey: "shopTheLook5Look3Pin2Name",
        price: 46,
        top: "76%",
        left: "62%",
      },
    ],
  },
  {
    id: "look-4",
    creatorNameKey: "shopTheLook5Look4CreatorName",
    seed: "stl5-look-4",
    pins: [
      {
        id: "look4-pin1",
        nameKey: "shopTheLook5Look4Pin1Name",
        price: 102,
        top: "28%",
        left: "40%",
      },
      {
        id: "look4-pin2",
        nameKey: "shopTheLook5Look4Pin2Name",
        price: 64,
        top: "70%",
        left: "56%",
      },
    ],
  },
];

export function LookGridHotspotsShopTheLook() {
  const t = useMessages("pages") as unknown as PagesWithShopTheLookMessages;
  const stl = t.shopTheLook;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {stl.shopTheLook5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {stl.shopTheLook5Heading}
          </h2>
          <p className="text-muted">{stl.shopTheLook5Description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {LOOKS.map((look) => (
            <div
              key={look.id}
              className="border-border bg-surface relative aspect-[4/5] overflow-hidden rounded-2xl border"
            >
              <Image
                src={placeholderImage(look.seed, "4x5")}
                alt={stl[look.creatorNameKey]}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <span className="bg-bg/85 text-fg rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  {stl[look.creatorNameKey]}
                </span>
                <Badge variant="soft" size="sm">
                  {look.pins.length} {stl.shopTheLook5ProductCountLabel}
                </Badge>
              </div>

              {look.pins.map((pin) => (
                <div
                  key={pin.id}
                  style={{ top: pin.top, left: pin.left }}
                  className="border-bg absolute size-7 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 shadow-md"
                >
                  <Popover>
                    <PopoverTrigger
                      aria-label={`${stl.shopTheLook5PinAriaPrefix} ${stl[pin.nameKey]}`}
                      className="bg-brand text-brand-fg data-[state=open]:bg-fg data-[state=open]:text-bg size-full items-center justify-center transition-colors"
                    >
                      <IconPlus size={14} aria-hidden="true" />
                    </PopoverTrigger>
                    <PopoverContent
                      title={stl[pin.nameKey]}
                      align="start"
                      sideOffset={10}
                      className="w-60"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-fg text-sm font-medium">
                          {stl[pin.nameKey]}
                        </span>
                        <span className="text-fg text-sm font-semibold">
                          {usd(pin.price)}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<IconShoppingBag size={14} />}
                          className="w-full"
                        >
                          {stl.shopTheLook5AddToBagLabel}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
