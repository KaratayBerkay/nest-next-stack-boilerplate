"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCircleCheck,
  IconHeart,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconStar,
  IconTruck,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;

interface StackedImage {
  seed: string;
  altKey: string;
}

const IMAGES: StackedImage[] = [
  { seed: "product-detail-6-lamp-a", altKey: "productDetail6Image1Alt" },
  { seed: "product-detail-6-lamp-b", altKey: "productDetail6Image2Alt" },
  { seed: "product-detail-6-lamp-c", altKey: "productDetail6Image3Alt" },
];

const HIGHLIGHT_KEYS = [
  "productDetail6Highlight1",
  "productDetail6Highlight2",
  "productDetail6Highlight3",
] as const;

export function StickyInfoPanelProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col gap-4">
          {IMAGES.map((image) => (
            <div
              key={image.seed}
              className="border-border bg-surface relative aspect-[4/5] w-full overflow-hidden rounded-3xl border"
            >
              <Image
                src={placeholderImage(image.seed, "4x5")}
                alt={pd[image.altKey]}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-2">
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              {pd.productDetail6Eyebrow}
            </span>
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail6Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar size={14} className="text-warning" fill="currentColor" aria-hidden="true" />
              <span className="text-fg font-medium">{pd.productDetail6RatingValue}</span>
              <span>{pd.productDetail6ReviewCount}</span>
            </div>
          </div>

          <span className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail6Price}
          </span>

          <p className="text-muted text-sm leading-relaxed">
            {pd.productDetail6Description}
          </p>

          <ul className="flex flex-col gap-2">
            {HIGHLIGHT_KEYS.map((key) => (
              <li key={key} className="text-muted flex items-start gap-2 text-sm">
                <IconCircleCheck size={16} className="text-brand mt-0.5 shrink-0" aria-hidden="true" />
                {pd[key]}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail6DecreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity <= MIN_QUANTITY}
                onClick={() => setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))}
              />
              <span className="text-fg w-6 text-center text-sm tabular-nums">{quantity}</span>
              <IconButton
                icon={<IconPlus size={14} />}
                label={pd.productDetail6IncreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              />
            </div>
            <Button variant="primary" className="flex-1">
              <IconShoppingBag size={16} aria-hidden="true" />
              {pd.productDetail6AddToCart}
            </Button>
            <IconButton
              icon={<IconHeart size={18} aria-hidden="true" />}
              label={pd.productDetail6WishlistAria}
              variant="outline"
              size="icon"
            />
          </div>

          <div className="text-muted flex items-center gap-2 text-xs">
            <IconTruck size={14} aria-hidden="true" />
            {pd.productDetail6ShippingNote}
          </div>
        </div>
      </div>
    </section>
  );
}
