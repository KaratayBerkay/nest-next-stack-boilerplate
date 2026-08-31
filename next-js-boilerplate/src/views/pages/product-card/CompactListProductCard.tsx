"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconHeart,
  IconHeartFilled,
  IconShoppingCart,
  IconStar,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

const ADDED_TIMEOUT_MS = 1600;

interface GadgetItem {
  id: string;
  nameKey: string;
  categoryKey: string;
  priceKey: string;
  rating: number;
  reviews: number;
  seed: string;
}

const ITEMS: GadgetItem[] = [
  {
    id: "wireless-earbuds",
    nameKey: "productCard4Product1Name",
    categoryKey: "productCard4Product1Category",
    priceKey: "productCard4Product1Price",
    rating: 4.6,
    reviews: 921,
    seed: "product-card-4-earbuds",
  },
  {
    id: "mechanical-keyboard",
    nameKey: "productCard4Product2Name",
    categoryKey: "productCard4Product2Category",
    priceKey: "productCard4Product2Price",
    rating: 4.8,
    reviews: 407,
    seed: "product-card-4-keyboard",
  },
  {
    id: "streaming-webcam",
    nameKey: "productCard4Product3Name",
    categoryKey: "productCard4Product3Category",
    priceKey: "productCard4Product3Price",
    rating: 4.3,
    reviews: 156,
    seed: "product-card-4-webcam",
  },
  {
    id: "adjustable-desk-lamp",
    nameKey: "productCard4Product4Name",
    categoryKey: "productCard4Product4Category",
    priceKey: "productCard4Product4Price",
    rating: 4.7,
    reviews: 268,
    seed: "product-card-4-desk-lamp",
  },
];

function ListCard({ item }: { item: GadgetItem }) {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const name = p[item.nameKey];

  function toggleWishlist() {
    setWishlisted((current) => !current);
  }

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), ADDED_TIMEOUT_MS);
  }

  return (
    <Card variant="default">
      <div className="flex items-center gap-4 p-3">
        <div className="bg-surface relative size-20 shrink-0 overflow-hidden rounded-lg sm:size-24">
          <Image
            src={placeholderImage(item.seed, "1x1")}
            alt={name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-muted text-xs">{p[item.categoryKey]}</span>
          <span className="text-fg truncate text-sm font-medium">{name}</span>
          <div className="text-muted flex items-center gap-1 text-xs">
            <IconStar
              size={13}
              className="text-warning"
              fill="currentColor"
              aria-hidden="true"
            />
            <span className="text-fg">{item.rating.toFixed(1)}</span>
            <span>
              {p.productCard4ReviewsLabel.replace(
                "{count}",
                String(item.reviews),
              )}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-fg text-sm font-semibold tracking-tight">
            {p[item.priceKey]}
          </span>
          <div className="flex items-center gap-1.5">
            <IconButton
              icon={
                wishlisted ? (
                  <IconHeartFilled
                    size={15}
                    aria-hidden="true"
                    className="text-error"
                  />
                ) : (
                  <IconHeart size={15} aria-hidden="true" />
                )
              }
              label={
                wishlisted
                  ? p.productCard4WishlistRemoveAria.replace("{name}", name)
                  : p.productCard4WishlistAddAria.replace("{name}", name)
              }
              aria-pressed={wishlisted}
              variant="ghost"
              size="icon-sm"
              onClick={toggleWishlist}
            />
            <IconButton
              icon={
                added ? (
                  <IconCheck size={15} aria-hidden="true" />
                ) : (
                  <IconShoppingCart size={15} aria-hidden="true" />
                )
              }
              label={
                added
                  ? p.productCard4AddedAria.replace("{name}", name)
                  : p.productCard4AddToCartAria.replace("{name}", name)
              }
              variant={added ? "soft" : "primary"}
              size="icon-sm"
              onClick={handleAddToCart}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CompactListProductCard() {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {p.productCard4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.productCard4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{p.productCard4Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {ITEMS.map((item) => (
            <ListCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
