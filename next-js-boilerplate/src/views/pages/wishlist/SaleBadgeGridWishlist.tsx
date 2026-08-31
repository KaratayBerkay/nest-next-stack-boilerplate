"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconHeartFilled,
  IconShoppingCart,
  IconStar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithWishlistMessages } from "@/types/pages/wishlist/WishlistMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface Wishlist1Product {
  id: string;
  nameKey: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  seed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const PRODUCTS: Wishlist1Product[] = [
  {
    id: "headphones",
    nameKey: "wishlist1Product1Name",
    price: 79,
    originalPrice: 99,
    rating: 4.6,
    reviews: 312,
    seed: "wishlist1-headphones",
  },
  {
    id: "backpack",
    nameKey: "wishlist1Product2Name",
    price: 64,
    rating: 4.8,
    reviews: 154,
    seed: "wishlist1-backpack",
  },
  {
    id: "sneakers",
    nameKey: "wishlist1Product3Name",
    price: 89,
    originalPrice: 120,
    rating: 4.4,
    reviews: 501,
    seed: "wishlist1-sneakers",
  },
  {
    id: "desklamp",
    nameKey: "wishlist1Product4Name",
    price: 45,
    rating: 4.7,
    reviews: 98,
    seed: "wishlist1-desklamp",
  },
  {
    id: "watch",
    nameKey: "wishlist1Product5Name",
    price: 149,
    originalPrice: 189,
    rating: 4.9,
    reviews: 276,
    seed: "wishlist1-watch",
  },
  {
    id: "sunglasses",
    nameKey: "wishlist1Product6Name",
    price: 54,
    rating: 4.3,
    reviews: 167,
    seed: "wishlist1-sunglasses",
  },
  {
    id: "totebag",
    nameKey: "wishlist1Product7Name",
    price: 39,
    rating: 4.5,
    reviews: 142,
    seed: "wishlist1-totebag",
  },
  {
    id: "candlejar",
    nameKey: "wishlist1Product8Name",
    price: 26,
    originalPrice: 34,
    rating: 4.6,
    reviews: 88,
    seed: "wishlist1-candlejar",
  },
];

const ALL_IDS = PRODUCTS.map((product) => product.id);

function discountPercent(product: Wishlist1Product): number {
  if (!product.originalPrice) return 0;
  return Math.round((1 - product.price / product.originalPrice) * 100);
}

export function SaleBadgeGridWishlist() {
  const t = useMessages("pages") as unknown as PagesWithWishlistMessages;
  const w = t.wishlist;

  const [savedIds, setSavedIds] = useState<string[]>(ALL_IDS);
  const [cartIds, setCartIds] = useState<string[]>([]);

  const items = PRODUCTS.filter((product) => savedIds.includes(product.id));

  function handleRemove(id: string) {
    setSavedIds((current) => current.filter((savedId) => savedId !== id));
  }

  function handleToggleCart(id: string) {
    setCartIds((current) =>
      current.includes(id)
        ? current.filter((cartId) => cartId !== id)
        : [...current, id],
    );
  }

  function handleRestore() {
    setSavedIds(ALL_IDS);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {w.wishlist1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {w.wishlist1Description}
          </Typography>
        </div>

        {items.length === 0 ? (
          <Empty
            icon={<IconHeartFilled size={40} aria-hidden="true" />}
            title={w.wishlist1EmptyTitle}
            description={w.wishlist1EmptyDescription}
            action={
              <Button variant="outline" onClick={handleRestore}>
                {w.wishlist1RestoreButton}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => {
              const inCart = cartIds.includes(product.id);
              const percentOff = discountPercent(product);
              const name = w[product.nameKey];
              return (
                <div
                  key={product.id}
                  className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border"
                >
                  <div className="bg-surface-hover relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={placeholderImage(product.seed, "4x5")}
                      alt={name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                    {percentOff > 0 && (
                      <Badge
                        variant="error"
                        size="sm"
                        className="absolute top-3 left-3"
                      >
                        {w.wishlist1DiscountBadge.replace(
                          "{percent}",
                          String(percentOff),
                        )}
                      </Badge>
                    )}
                    <IconButton
                      icon={
                        <IconHeartFilled
                          size={16}
                          aria-hidden="true"
                          className="text-error"
                        />
                      }
                      label={w.wishlist1RemoveAria.replace("{name}", name)}
                      variant="default"
                      size="icon-sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemove(product.id)}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="text-fg text-sm font-medium">{name}</span>
                    <div className="text-muted flex items-center gap-1 text-xs">
                      <IconStar
                        size={14}
                        className="text-warning"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      <span className="text-fg">
                        {product.rating.toFixed(1)}
                      </span>
                      <span>
                        {w.wishlist1ReviewsLabel.replace(
                          "{count}",
                          String(product.reviews),
                        )}
                      </span>
                    </div>
                    <div className="mt-auto flex items-baseline gap-2 pt-1">
                      <span className="text-fg text-lg font-semibold tracking-tight">
                        {usd(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-muted text-sm line-through">
                          {usd(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant={inCart ? "soft" : "primary"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleToggleCart(product.id)}
                    >
                      {inCart ? (
                        <>
                          <IconCheck size={14} aria-hidden="true" />
                          {w.wishlist1InCart}
                        </>
                      ) : (
                        <>
                          <IconShoppingCart size={14} aria-hidden="true" />
                          {w.wishlist1AddToCart}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
