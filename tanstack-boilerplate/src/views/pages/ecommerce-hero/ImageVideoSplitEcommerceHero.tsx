"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconShoppingBag,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithEcommerceHeroMessages } from "@/types/pages/ecommerce-hero/EcommerceHeroMessages-types";

const IMAGE_SEED = "ecom-hero2-image";
const VIDEO_SEED = "ecom-hero2-video";

export function ImageVideoSplitEcommerceHero() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceHeroMessages;
  const eh = t.ecommerceHero;
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="soft">{eh.ecommerceHero2Eyebrow}</Badge>
          <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
            {eh.ecommerceHero2Heading}
          </h1>
          <p className="text-muted text-lg">{eh.ecommerceHero2Subheading}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg">
              {eh.ecommerceHero2PrimaryCta}
            </Button>
            <Button variant="ghost" size="lg">
              {eh.ecommerceHero2SecondaryCta}
            </Button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Image panel */}
          <div className="border-border relative aspect-[4/3] overflow-hidden rounded-3xl border sm:aspect-[16/10] lg:aspect-[4/5]">
            <Image
              src={placeholderImage(IMAGE_SEED, "4x5")}
              alt={eh.ecommerceHero2ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="border-border bg-bg/95 absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border p-3 shadow-md backdrop-blur-sm">
              <span className="bg-muted/15 text-fg flex size-10 shrink-0 items-center justify-center rounded-xl">
                <IconShoppingBag size={18} />
              </span>
              <div className="flex flex-col">
                <span className="text-fg text-sm font-semibold">
                  {eh.ecommerceHero2ImageCaption}
                </span>
                <span className="text-muted text-xs">
                  {eh.ecommerceHero2ImagePrice}
                </span>
              </div>
            </div>
          </div>

          {/* Video panel */}
          <div className="border-border bg-bg relative aspect-[4/3] overflow-hidden rounded-3xl border sm:aspect-[16/10] lg:aspect-[4/5]">
            <Image
              src={placeholderImage(VIDEO_SEED, "4x5")}
              alt={eh.ecommerceHero2VideoAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={
                isPlaying ? "object-cover opacity-60" : "object-cover"
              }
            />
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-pressed={isPlaying}
              aria-label={
                isPlaying
                  ? eh.ecommerceHero2PauseAria
                  : eh.ecommerceHero2PlayAria
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="bg-bg/80 flex size-16 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-transform hover:scale-105">
                {isPlaying ? (
                  <IconPlayerPause
                    size={26}
                    className="text-fg"
                    aria-hidden="true"
                  />
                ) : (
                  <IconPlayerPlay
                    size={26}
                    className="text-fg ml-0.5"
                    aria-hidden="true"
                  />
                )}
              </span>
            </button>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {isPlaying && (
                <span
                  className="bg-error size-2 animate-pulse rounded-full"
                  aria-hidden="true"
                />
              )}
              <span className="bg-bg/90 text-fg rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {isPlaying
                  ? eh.ecommerceHero2NowPlaying
                  : eh.ecommerceHero2VideoDuration}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
