"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconHeart,
  IconHeartFilled,
  IconShoppingBag,
  IconStar,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

const ADDED_TIMEOUT_MS = 1800;

interface ShoeItem {
  id: string;
  nameKey: string;
  priceKey: string;
  badgeKey?: "productCard1BadgeNew" | "productCard1BadgeBestseller";
  rating: number;
  reviews: number;
  seed: string;
}

const SHOES: ShoeItem[] = [
  {
    id: "trail-runner-low",
    nameKey: "productCard1Product1Name",
    priceKey: "productCard1Product1Price",
    badgeKey: "productCard1BadgeNew",
    rating: 4.7,
    reviews: 312,
    seed: "product-card-1-trail-runner",
  },
  {
    id: "court-classic",
    nameKey: "productCard1Product2Name",
    priceKey: "productCard1Product2Price",
    rating: 4.5,
    reviews: 188,
    seed: "product-card-1-court-classic",
  },
  {
    id: "cloudpeak-knit",
    nameKey: "productCard1Product3Name",
    priceKey: "productCard1Product3Price",
    badgeKey: "productCard1BadgeBestseller",
    rating: 4.9,
    reviews: 64,
    seed: "product-card-1-cloudpeak-knit",
  },
  {
    id: "retro-runner-90",
    nameKey: "productCard1Product4Name",
    priceKey: "productCard1Product4Price",
    rating: 4.4,
    reviews: 450,
    seed: "product-card-1-retro-runner",
  },
];

export function HoverSwapAngleProductCard() {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;
  const [wishlisted, setWishlisted] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  function toggleWishlist(id: string) {
    setWishlisted((current) =>
      current.includes(id)
        ? current.filter((wishId) => wishId !== id)
        : [...current, id],
    );
  }

  function handleAddToCart(id: string) {
    setAddedId(id);
    setTimeout(() => {
      setAddedId((current) => (current === id ? null : current));
    }, ADDED_TIMEOUT_MS);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {p.productCard1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.productCard1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{p.productCard1Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SHOES.map((shoe) => {
            const name = p[shoe.nameKey];
            const isWishlisted = wishlisted.includes(shoe.id);
            const isAdded = addedId === shoe.id;

            return (
              <Card key={shoe.id} variant="interactive">
                <div className="flex flex-col">
                  <div className="group bg-surface relative aspect-square overflow-hidden rounded-t-xl">
                    <Image
                      src={placeholderImage(shoe.seed, "1x1")}
                      alt={name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
                      className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                    />
                    <Image
                      src={placeholderImage(`${shoe.seed}-back`, "1x1")}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
                      className="absolute inset-0 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    {shoe.badgeKey && (
                      <Badge
                        variant={
                          shoe.badgeKey === "productCard1BadgeNew"
                            ? "info"
                            : "soft"
                        }
                        size="sm"
                        className="absolute top-3 left-3"
                      >
                        {p[shoe.badgeKey]}
                      </Badge>
                    )}
                    <IconButton
                      icon={
                        isWishlisted ? (
                          <IconHeartFilled
                            size={16}
                            aria-hidden="true"
                            className="text-error"
                          />
                        ) : (
                          <IconHeart size={16} aria-hidden="true" />
                        )
                      }
                      label={
                        isWishlisted
                          ? p.productCard1WishlistRemoveAria.replace(
                              "{name}",
                              name,
                            )
                          : p.productCard1WishlistAddAria.replace(
                              "{name}",
                              name,
                            )
                      }
                      aria-pressed={isWishlisted}
                      variant="default"
                      size="icon-sm"
                      className="absolute top-2 right-2"
                      onClick={() => toggleWishlist(shoe.id)}
                    />
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="text-fg text-sm font-medium">{name}</span>
                    <div className="text-muted flex items-center gap-1 text-xs">
                      <IconStar
                        size={14}
                        className="text-warning"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      <span className="text-fg">{shoe.rating.toFixed(1)}</span>
                      <span>
                        {p.productCard1ReviewsLabel.replace(
                          "{count}",
                          String(shoe.reviews),
                        )}
                      </span>
                    </div>
                    <span className="text-fg text-base font-semibold tracking-tight">
                      {p[shoe.priceKey]}
                    </span>
                    <Button
                      variant={isAdded ? "soft" : "primary"}
                      size="sm"
                      className="mt-1 w-full"
                      onClick={() => handleAddToCart(shoe.id)}
                    >
                      {isAdded ? (
                        <>
                          <IconCheck size={14} aria-hidden="true" />
                          {p.productCard1AddedLabel}
                        </>
                      ) : (
                        <>
                          <IconShoppingBag size={14} aria-hidden="true" />
                          {p.productCard1AddToCartLabel}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
