"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconStar,
  IconZoomIn,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;
const ZOOM_FACTOR = 220;

const IMAGE_SEEDS = [
  "product-detail-2-sneaker-a",
  "product-detail-2-sneaker-b",
  "product-detail-2-sneaker-c",
  "product-detail-2-sneaker-d",
] as const;

const FEATURE_KEYS = [
  "productDetail2Feature1",
  "productDetail2Feature2",
  "productDetail2Feature3",
] as const;

interface ZoomPoint {
  x: number;
  y: number;
}

export function HoverZoomGalleryProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hovering, setHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState<ZoomPoint>({ x: 50, y: 50 });
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.min(
      100,
      Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
    );
    setZoomPos({ x, y });
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col gap-3">
          <div
            className="border-border bg-surface relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl border"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={placeholderImage(IMAGE_SEEDS[activeIndex], "1x1")}
              alt={pd.productDetail2ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-no-repeat opacity-0 transition-opacity duration-150 data-[state=active]:opacity-100"
              data-state={hovering ? "active" : "inactive"}
              style={{
                backgroundImage: `url(${placeholderImage(IMAGE_SEEDS[activeIndex], "1x1")})`,
                backgroundSize: `${ZOOM_FACTOR}%`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
            <span className="bg-bg/85 text-muted pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs">
              <IconZoomIn size={14} aria-hidden="true" />
              {pd.productDetail2ZoomHint}
            </span>
          </div>

          <div className="flex gap-3">
            {IMAGE_SEEDS.map((seed, index) => (
              <button
                key={seed}
                type="button"
                onClick={() => setActiveIndex(index)}
                data-state={activeIndex === index ? "active" : "inactive"}
                aria-label={pd.productDetail2ThumbAria.replace(
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
              {pd.productDetail2Eyebrow}
            </span>
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail2Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar
                size={14}
                className="text-warning"
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="text-fg font-medium">
                {pd.productDetail2RatingValue}
              </span>
              <span>{pd.productDetail2ReviewCount}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-fg text-2xl font-semibold tracking-tight">
              {pd.productDetail2Price}
            </span>
            <span className="text-muted text-base line-through">
              {pd.productDetail2OriginalPrice}
            </span>
            <Badge variant="error" size="sm">
              {pd.productDetail2DiscountBadge}
            </Badge>
          </div>

          <ul className="flex flex-col gap-2">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="text-muted flex items-start gap-2 text-sm"
              >
                <IconCheck
                  size={16}
                  className="text-brand mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {pd[key]}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <span className="text-muted text-sm">
              {pd.productDetail2QuantityLabel}
            </span>
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail2DecreaseAria}
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
                label={pd.productDetail2IncreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() =>
                  setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg">
              {pd.productDetail2AddToCart}
            </Button>
            <Button variant="outline" size="lg">
              {pd.productDetail2BuyNow}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
