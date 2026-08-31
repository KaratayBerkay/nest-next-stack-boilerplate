"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconStarFilled,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

type Stock = "in" | "low" | "out";
type SortDir = "asc" | "desc" | null;

interface ProductEntry {
  id: string;
  seed: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  stock: Stock;
  stockKey: string;
  rating: number;
}

const PRODUCTS: ProductEntry[] = [
  {
    id: "dit-1",
    seed: "dit-mesh-router",
    nameKey: "productList6Product1Name",
    categoryKey: "productList6CategoryNetworking",
    price: 179,
    stock: "in",
    stockKey: "productList6StockInStock",
    rating: 4.5,
  },
  {
    id: "dit-2",
    seed: "dit-switch-8port",
    nameKey: "productList6Product2Name",
    categoryKey: "productList6CategoryNetworking",
    price: 64,
    stock: "in",
    stockKey: "productList6StockInStock",
    rating: 4.3,
  },
  {
    id: "dit-3",
    seed: "dit-wifi-extender",
    nameKey: "productList6Product3Name",
    categoryKey: "productList6CategoryNetworking",
    price: 39,
    stock: "low",
    stockKey: "productList6StockLowStock",
    rating: 3.9,
  },
  {
    id: "dit-4",
    seed: "dit-nas-4bay",
    nameKey: "productList6Product4Name",
    categoryKey: "productList6CategoryStorage",
    price: 449,
    stock: "in",
    stockKey: "productList6StockInStock",
    rating: 4.7,
  },
  {
    id: "dit-5",
    seed: "dit-ssd-2tb",
    nameKey: "productList6Product5Name",
    categoryKey: "productList6CategoryStorage",
    price: 129,
    stock: "in",
    stockKey: "productList6StockInStock",
    rating: 4.6,
  },
  {
    id: "dit-6",
    seed: "dit-nvme-enclosure",
    nameKey: "productList6Product6Name",
    categoryKey: "productList6CategoryStorage",
    price: 54,
    stock: "out",
    stockKey: "productList6StockOutOfStock",
    rating: 4.1,
  },
  {
    id: "dit-7",
    seed: "dit-mech-keyboard",
    nameKey: "productList6Product7Name",
    categoryKey: "productList6CategoryPeripherals",
    price: 98,
    stock: "in",
    stockKey: "productList6StockInStock",
    rating: 4.8,
  },
  {
    id: "dit-8",
    seed: "dit-wireless-mouse",
    nameKey: "productList6Product8Name",
    categoryKey: "productList6CategoryPeripherals",
    price: 46,
    stock: "low",
    stockKey: "productList6StockLowStock",
    rating: 4.2,
  },
  {
    id: "dit-9",
    seed: "dit-usb-dock",
    nameKey: "productList6Product9Name",
    categoryKey: "productList6CategoryPeripherals",
    price: 89,
    stock: "in",
    stockKey: "productList6StockInStock",
    rating: 4.4,
  },
];

const STOCK_VARIANT: Record<Stock, BadgeVariant> = {
  in: "success",
  low: "warning",
  out: "outline",
};

const usd = (n: number) => `$${n.toFixed(2)}`;

export function DenseInventoryTableProductList() {
  const t = useMessages("pages") as unknown as PagesWithProductListMessages;
  const pl = t.productList;
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const rows = useMemo(() => {
    if (!sortDir) return PRODUCTS;
    const sorted = [...PRODUCTS];
    sorted.sort((a, b) =>
      sortDir === "asc" ? a.price - b.price : b.price - a.price,
    );
    return sorted;
  }, [sortDir]);

  const cycleSort = () => {
    setSortDir((prev) =>
      prev === null ? "asc" : prev === "asc" ? "desc" : null,
    );
  };

  const SortIcon =
    sortDir === "asc"
      ? IconArrowUp
      : sortDir === "desc"
        ? IconArrowDown
        : IconArrowsSort;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pl.productList6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pl.productList6Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed">
            {pl.productList6Intro}
          </p>
        </div>

        <div className="mt-10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{pl.productList6ColProduct}</TableHead>
                <TableHead>{pl.productList6ColCategory}</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={cycleSort}
                    className="hover:text-fg inline-flex items-center gap-1"
                    aria-label={pl.productList6SortByPriceAria}
                  >
                    {pl.productList6ColPrice}
                    <SortIcon size={14} aria-hidden="true" />
                  </button>
                </TableHead>
                <TableHead>{pl.productList6ColStock}</TableHead>
                <TableHead>{pl.productList6ColRating}</TableHead>
                <TableHead className="text-right">
                  {pl.productList6ColActions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="border-border bg-surface relative size-10 shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={placeholderImage(product.seed, "1x1")}
                          alt={pl[product.nameKey]}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-fg text-sm font-medium">
                        {pl[product.nameKey]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted text-sm">
                    {pl[product.categoryKey]}
                  </TableCell>
                  <TableCell className="text-fg text-sm font-semibold tabular-nums">
                    {usd(product.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STOCK_VARIANT[product.stock]} size="sm">
                      {pl[product.stockKey]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-muted flex items-center gap-1 text-xs"
                      aria-label={pl.productList6RatingAriaTemplate
                        .replace("{name}", pl[product.nameKey])
                        .replace("{rating}", product.rating.toFixed(1))}
                    >
                      <IconStarFilled
                        size={14}
                        className="text-warning"
                        aria-hidden="true"
                      />
                      {product.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="ghost" size="sm">
                      {pl.productList6ViewLabel}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
