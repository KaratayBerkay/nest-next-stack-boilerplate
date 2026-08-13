"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  IconCheck,
  IconDeviceLaptop,
  IconPlus,
  IconShoppingCart,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareProductsMessages } from "@/types/pages/compare-products/CompareProductsMessages-types";

interface ProductRow {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating: string;
  reviews: string;
  badge?: string;
  highlights: string[];
}

const PRODUCTS: ProductRow[] = [
  {
    id: "probook-x",
    name: "ProBook X",
    price: "$1,299.00",
    originalPrice: "$1,499.00",
    rating: "4.9",
    reviews: "2,431",
    badge: "compareProducts3Badge",
    highlights: [
      '14" 3K OLED display',
      "32GB LPDDR5X memory",
      "18-hour battery life",
    ],
  },
  {
    id: "airtech",
    name: "AirTech",
    price: "$1,099.00",
    rating: "4.7",
    reviews: "1,897",
    highlights: [
      '13.6" Liquid Retina display',
      "16GB unified memory",
      "16-hour battery life",
    ],
  },
  {
    id: "vertex-14",
    name: "Vertex 14",
    price: "$949.00",
    rating: "4.5",
    reviews: "1,204",
    highlights: [
      '14" 2.8K IPS display',
      "16GB DDR5 memory",
      "12-hour battery life",
    ],
  },
  {
    id: "pulse-mini",
    name: "Pulse Mini",
    price: "$749.00",
    originalPrice: "$849.00",
    rating: "4.3",
    reviews: "986",
    highlights: [
      '14" Full HD display',
      "8GB DDR5 memory",
      "9-hour battery life",
    ],
  },
];

function toggleCart(
  id: string,
  setCartIds: Dispatch<SetStateAction<string[]>>,
) {
  setCartIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
  );
}

function removeProduct(
  id: string,
  setActiveIds: Dispatch<SetStateAction<string[]>>,
) {
  setActiveIds((prev) => prev.filter((x) => x !== id));
}

export function CartActionsComparison() {
  const m = useMessages("pages") as unknown as PagesWithCompareProductsMessages;
  const co = m.compareProducts;
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>(
    PRODUCTS.map((p) => p.id),
  );
  const visible = PRODUCTS.filter((p) => activeIds.includes(p.id));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compareProducts3Title}
          </h2>
          <p className="text-muted max-w-2xl text-lg">
            {co.compareProducts3Description}
          </p>
        </div>

        <div className="mb-8 flex justify-end">
          <Button variant="outline" size="sm" className="gap-2">
            <IconShoppingCart size={16} />
            {co.compareProducts3Cart}
            <Badge size="sm" variant="soft" className="ml-1 rounded-full">
              {cartIds.length}
            </Badge>
          </Button>
        </div>

        {visible.length === 0 ? (
          <div className="border-border bg-surface flex flex-col items-center gap-3 rounded-3xl border px-6 py-16 text-center shadow-xs">
            <IconShoppingCart size={40} className="text-muted" stroke={1.2} />
            <p className="text-muted">{co.compareProducts3Empty}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visible.map((product) => (
              <article
                key={product.id}
                className="border-border bg-surface ring-border relative flex flex-col gap-4 rounded-3xl border p-5 shadow-xs ring-1 ring-inset"
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={co.compareProducts3RemoveButton}
                  className="absolute top-3 right-3"
                  onClick={() => removeProduct(product.id, setActiveIds)}
                >
                  <IconX size={16} />
                </Button>
                <div className="bg-surface-hover ring-border flex h-36 items-center justify-center rounded-2xl ring-1 ring-inset">
                  <IconDeviceLaptop
                    size={64}
                    className="text-muted"
                    stroke={1.2}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  {product.badge && (
                    <Badge size="sm" className="w-fit">
                      {co[product.badge]}
                    </Badge>
                  )}
                  <h3 className="text-lg leading-tight font-semibold">
                    {product.name}
                  </h3>
                  <div className="text-muted flex items-center gap-1.5 text-sm">
                    <IconStar
                      size={16}
                      className="text-warning"
                      fill="currentColor"
                    />
                    <span className="text-fg">{product.rating}</span>
                    <span>
                      ({product.reviews} {co.compareProducts3Reviews})
                    </span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {product.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="text-muted flex items-start gap-2 text-sm"
                    >
                      <IconCheck size={16} className="text-success mt-0.5" />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted text-sm line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
                <Button
                  variant={cartIds.includes(product.id) ? "soft" : "default"}
                  className="w-full"
                  onClick={() => toggleCart(product.id, setCartIds)}
                >
                  {cartIds.includes(product.id) ? (
                    <>
                      <IconCheck size={16} />
                      {co.compareProducts3InCart}
                    </>
                  ) : (
                    <>
                      <IconPlus size={16} />
                      {co.compareProducts3AddButton}
                    </>
                  )}
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
