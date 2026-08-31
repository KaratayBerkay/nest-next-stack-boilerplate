"use client";

import Image from "next/image";
import { IconShoppingBag } from "@tabler/icons-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/HoverCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithShopTheLookMessages } from "@/types/pages/shop-the-look/ShopTheLookMessages-types";

const usd = (n: number) => `$${n.toFixed(2)}`;

interface RoomMarker {
  id: string;
  nameKey: string;
  price: number;
  seed: string;
  top: string;
  left: string;
}

const MARKERS: RoomMarker[] = [
  {
    id: "sofa",
    nameKey: "shopTheLook4Item1Name",
    price: 640,
    seed: "stl4-sofa",
    top: "60%",
    left: "30%",
  },
  {
    id: "lamp",
    nameKey: "shopTheLook4Item2Name",
    price: 88,
    seed: "stl4-lamp",
    top: "26%",
    left: "74%",
  },
  {
    id: "rug",
    nameKey: "shopTheLook4Item3Name",
    price: 216,
    seed: "stl4-rug",
    top: "84%",
    left: "58%",
  },
];

export function RoomHoverRevealShopTheLook() {
  const t = useMessages("pages") as unknown as PagesWithShopTheLookMessages;
  const stl = t.shopTheLook;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {stl.shopTheLook4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {stl.shopTheLook4Heading}
          </h2>
          <p className="text-muted">{stl.shopTheLook4Description}</p>
        </div>

        <div className="border-border bg-surface relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border">
          <Image
            src={placeholderImage("stl4-room", "16x9")}
            alt={stl.shopTheLook4PhotoAlt}
            fill
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="object-cover"
          />
          {MARKERS.map((marker) => (
            <div
              key={marker.id}
              style={{ top: marker.top, left: marker.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${stl.shopTheLook4MarkerAriaPrefix} ${stl[marker.nameKey]}`}
                    className="focus-visible:ring-brand relative flex size-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-brand absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none"
                    />
                    <span
                      aria-hidden="true"
                      className="bg-brand border-bg relative inline-flex size-4 rounded-full border-2 shadow-md"
                    />
                  </button>
                </HoverCardTrigger>
                {/* No width override here: HoverCardContent bakes in `w-72`
                    directly (unlike PopoverContent, which sets no width
                    class) and cn() won't reliably let a later `w-64` win. */}
                <HoverCardContent>
                  <div className="flex gap-3">
                    <div className="bg-surface-hover relative size-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={placeholderImage(marker.seed, "1x1")}
                        alt={stl[marker.nameKey]}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-fg text-sm font-medium">
                        {stl[marker.nameKey]}
                      </span>
                      <span className="text-fg text-sm font-semibold">
                        {usd(marker.price)}
                      </span>
                      <span className="text-muted flex items-center gap-1 text-xs">
                        <IconShoppingBag size={12} aria-hidden="true" />
                        {stl.shopTheLook4HintCaption}
                      </span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
