"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  IconHeart,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;

const IMAGE_SEEDS = [
  "product-detail-10-speaker-a",
  "product-detail-10-speaker-b",
] as const;

export function StickyAddToCartBarProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);
  const [barVisible, setBarVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        setBarVisible(!entry.isIntersecting);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="border-border bg-surface relative aspect-square w-full overflow-hidden rounded-3xl border">
            <Image
              src={placeholderImage(IMAGE_SEEDS[activeIndex], "1x1")}
              alt={pd.productDetail10ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex gap-3">
            {IMAGE_SEEDS.map((seed, index) => (
              <button
                key={seed}
                type="button"
                onClick={() => setActiveIndex(index)}
                data-state={activeIndex === index ? "active" : "inactive"}
                aria-label={pd.productDetail10ThumbAria.replace(
                  "{n}",
                  String(index + 1),
                )}
                className="border-border data-[state=active]:ring-brand data-[state=active]:ring-offset-bg relative size-16 shrink-0 overflow-hidden rounded-lg border data-[state=active]:ring-2 data-[state=active]:ring-offset-2"
              >
                <Image
                  src={placeholderImage(seed, "1x1")}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              {pd.productDetail10Eyebrow}
            </span>
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail10Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar
                size={14}
                className="text-warning"
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="text-fg font-medium">
                {pd.productDetail10RatingValue}
              </span>
              <span>{pd.productDetail10ReviewCount}</span>
            </div>
          </div>

          <span className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail10Price}
          </span>

          <p className="text-muted text-sm leading-relaxed">
            {pd.productDetail10Description}
          </p>

          <div className="flex items-center gap-3">
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail10DecreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity <= MIN_QUANTITY}
                onClick={() =>
                  setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))
                }
              />
              <span className="text-fg w-6 text-center text-sm tabular-nums">
                {quantity}
              </span>
              <IconButton
                icon={<IconPlus size={14} />}
                label={pd.productDetail10IncreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() =>
                  setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
                }
              />
            </div>
            <Button variant="primary" className="flex-1">
              <IconShoppingBag size={16} aria-hidden="true" />
              {pd.productDetail10AddToCart}
            </Button>
            <IconButton
              icon={<IconHeart size={18} aria-hidden="true" />}
              label={pd.productDetail10WishlistAria}
              variant="outline"
              size="icon"
            />
          </div>

          <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
        </div>
      </div>

      <div
        data-state={barVisible ? "active" : "inactive"}
        className={cn(
          "bg-bg border-border pointer-events-none fixed inset-x-0 bottom-0 z-40 translate-y-full border-t opacity-0 shadow-lg transition-all duration-200",
          "data-[state=active]:pointer-events-auto data-[state=active]:translate-y-0 data-[state=active]:opacity-100",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3 lg:px-8">
          <div className="border-border bg-surface relative size-12 shrink-0 overflow-hidden rounded-lg border">
            <Image
              src={placeholderImage(IMAGE_SEEDS[0], "1x1")}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-fg truncate text-sm font-medium">
              {pd.productDetail10Name}
            </p>
            <p className="text-muted text-sm">{pd.productDetail10Price}</p>
          </div>
          <Button variant="primary" size="sm">
            <IconShoppingBag size={14} aria-hidden="true" />
            {pd.productDetail10AddToCart}
          </Button>
        </div>
      </div>
    </section>
  );
}
