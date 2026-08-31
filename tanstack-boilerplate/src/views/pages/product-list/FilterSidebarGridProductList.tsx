"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { IconStarFilled } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckboxGroup } from "@/components/ui/Checkbox";
import { Empty } from "@/components/ui/Empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithProductListMessages } from "@/types/pages/product-list/ProductListMessages-types";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";
type Stock = "in" | "low" | "out";

interface ProductEntry {
  id: string;
  seed: string;
  nameKey: string;
  categoryId: string;
  categoryKey: string;
  price: number;
  rating: number;
  stock: Stock;
  stockKey: string;
}

const PRODUCTS: ProductEntry[] = [
  {
    id: "psg-1",
    seed: "psg-arlo-pendant",
    nameKey: "productList1Product1Name",
    categoryId: "lighting",
    categoryKey: "productList1CategoryLighting",
    price: 89,
    rating: 4.6,
    stock: "in",
    stockKey: "productList1StockInStock",
  },
  {
    id: "psg-2",
    seed: "psg-nova-lamp",
    nameKey: "productList1Product2Name",
    categoryId: "lighting",
    categoryKey: "productList1CategoryLighting",
    price: 54,
    rating: 4.2,
    stock: "low",
    stockKey: "productList1StockLowStock",
  },
  {
    id: "psg-3",
    seed: "psg-haven-lounge",
    nameKey: "productList1Product3Name",
    categoryId: "seating",
    categoryKey: "productList1CategorySeating",
    price: 249,
    rating: 4.8,
    stock: "in",
    stockKey: "productList1StockInStock",
  },
  {
    id: "psg-4",
    seed: "psg-milo-stool",
    nameKey: "productList1Product4Name",
    categoryId: "seating",
    categoryKey: "productList1CategorySeating",
    price: 129,
    rating: 4.1,
    stock: "in",
    stockKey: "productList1StockInStock",
  },
  {
    id: "psg-5",
    seed: "psg-crate-ottoman",
    nameKey: "productList1Product5Name",
    categoryId: "storage",
    categoryKey: "productList1CategoryStorage",
    price: 159,
    rating: 4.4,
    stock: "out",
    stockKey: "productList1StockOutOfStock",
  },
  {
    id: "psg-6",
    seed: "psg-loom-shelf",
    nameKey: "productList1Product6Name",
    categoryId: "storage",
    categoryKey: "productList1CategoryStorage",
    price: 219,
    rating: 4.7,
    stock: "in",
    stockKey: "productList1StockInStock",
  },
  {
    id: "psg-7",
    seed: "psg-terra-vase",
    nameKey: "productList1Product7Name",
    categoryId: "decor",
    categoryKey: "productList1CategoryDecor",
    price: 42,
    rating: 4.3,
    stock: "in",
    stockKey: "productList1StockInStock",
  },
  {
    id: "psg-8",
    seed: "psg-wisp-mirror",
    nameKey: "productList1Product8Name",
    categoryId: "decor",
    categoryKey: "productList1CategoryDecor",
    price: 96,
    rating: 4.5,
    stock: "low",
    stockKey: "productList1StockLowStock",
  },
];

const CATEGORY_IDS = ["lighting", "seating", "storage", "decor"] as const;
const CATEGORY_KEYS: Record<(typeof CATEGORY_IDS)[number], string> = {
  lighting: "productList1CategoryLighting",
  seating: "productList1CategorySeating",
  storage: "productList1CategoryStorage",
  decor: "productList1CategoryDecor",
};

const STOCK_VARIANT: Record<Stock, BadgeVariant> = {
  in: "success",
  low: "warning",
  out: "outline",
};

const SORT_OPTIONS: { value: SortKey; labelKey: string }[] = [
  { value: "featured", labelKey: "productList1SortFeatured" },
  { value: "price-asc", labelKey: "productList1SortPriceAsc" },
  { value: "price-desc", labelKey: "productList1SortPriceDesc" },
  { value: "name-asc", labelKey: "productList1SortNameAsc" },
];

const PAGE_SIZE = 4;
const MAX_PRICE = 300;
const usd = (n: number) => `$${n.toFixed(2)}`;

function sortProducts(
  products: ProductEntry[],
  sortKey: SortKey,
  pl: Record<string, string>,
): ProductEntry[] {
  const sorted = [...products];
  if (sortKey === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sortKey === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (sortKey === "name-asc")
    sorted.sort((a, b) => pl[a.nameKey].localeCompare(pl[b.nameKey]));
  return sorted;
}

export function FilterSidebarGridProductList() {
  const t = useMessages("pages") as unknown as PagesWithProductListMessages;
  const pl = t.productList;
  const [categories, setCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(MAX_PRICE);
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const byFilter = PRODUCTS.filter(
      (p) =>
        (categories.length === 0 || categories.includes(p.categoryId)) &&
        p.price <= maxPrice,
    );
    return sortProducts(byFilter, sortKey, pl);
  }, [categories, maxPrice, sortKey, pl]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {pl.productList1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pl.productList1Heading}
          </h2>
          <p className="text-muted max-w-2xl leading-relaxed">
            {pl.productList1Intro}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-4">
          <aside className="border-border bg-surface flex flex-col gap-6 rounded-xl border p-5 lg:col-span-1 lg:self-start">
            <div className="flex items-center justify-between gap-2">
              <p className="text-fg text-sm font-semibold">
                {pl.productList1FiltersHeading}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategories([]);
                  setMaxPrice(MAX_PRICE);
                  setPage(1);
                }}
                className="text-brand text-xs font-medium hover:underline"
              >
                {pl.productList1ResetLabel}
              </button>
            </div>

            <CheckboxGroup
              label={pl.productList1CategoryLegend}
              values={categories}
              onValueChange={(values) => {
                setCategories(values);
                setPage(1);
              }}
              items={CATEGORY_IDS.map((id) => ({
                value: id,
                label: pl[CATEGORY_KEYS[id]],
              }))}
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-fg text-sm font-medium">
                  {pl.productList1PriceLabel}
                </span>
                <span className="text-muted text-xs tabular-nums">
                  {pl.productList1PriceValueTemplate.replace(
                    "{price}",
                    usd(maxPrice),
                  )}
                </span>
              </div>
              <Slider
                value={[maxPrice]}
                onValueChange={(value) => {
                  setMaxPrice(value[0] ?? MAX_PRICE);
                  setPage(1);
                }}
                min={0}
                max={MAX_PRICE}
                step={10}
                aria-label={pl.productList1PriceLabel}
              />
            </div>
          </aside>

          <div className="flex flex-col gap-6 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted text-sm">
                {pl.productList1ResultsCountTemplate.replace(
                  "{count}",
                  String(filtered.length),
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-muted text-xs font-medium tracking-wide uppercase">
                  {pl.productList1SortLabel}
                </span>
                <Select
                  value={sortKey}
                  onValueChange={(value) => setSortKey(value as SortKey)}
                  name="product-list-1-sort"
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {pl[option.labelKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {pageItems.length === 0 ? (
              <Empty
                title={pl.productList1EmptyTitle}
                description={pl.productList1EmptyDescription}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {pageItems.map((product) => (
                  <Card key={product.id} variant="default">
                    <div className="flex flex-col gap-3 p-4">
                      <div className="border-border bg-bg relative aspect-4/3 overflow-hidden rounded-lg border">
                        <Image
                          src={placeholderImage(product.seed, "4x3")}
                          alt={pl[product.nameKey]}
                          fill
                          sizes="(min-width: 1024px) 320px, 90vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-muted text-xs">
                            {pl[product.categoryKey]}
                          </p>
                          <p className="text-fg truncate text-sm font-semibold">
                            {pl[product.nameKey]}
                          </p>
                        </div>
                        <Badge variant={STOCK_VARIANT[product.stock]} size="sm">
                          {pl[product.stockKey]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-fg text-sm font-semibold tabular-nums">
                          {usd(product.price)}
                        </span>
                        <span
                          className="text-muted flex items-center gap-1 text-xs"
                          aria-label={pl.productList1RatingAriaTemplate
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
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination aria-label={pl.productList1PaginationAria}>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(Math.max(1, currentPage - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(Math.min(totalPages, currentPage + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
