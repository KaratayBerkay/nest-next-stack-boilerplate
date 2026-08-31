"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconHeart,
  IconMinus,
  IconPlus,
  IconRotate2,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;
const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const IMAGE_SEEDS = [
  "product-detail-5-tee-a",
  "product-detail-5-tee-b",
  "product-detail-5-tee-c",
] as const;

interface ColorOption {
  id: string;
  nameKey: string;
  hex: string;
}

const COLORS: ColorOption[] = [
  { id: "chalk", nameKey: "productDetail5Color1", hex: "#e7e2d9" },
  { id: "ink", nameKey: "productDetail5Color2", hex: "#22262b" },
  { id: "clay", nameKey: "productDetail5Color3", hex: "#b5654a" },
];

interface SizeRow {
  size: (typeof SIZES)[number];
  chestKey: string;
  lengthKey: string;
}

const SIZE_ROWS: SizeRow[] = [
  {
    size: "S",
    chestKey: "productDetail5ChestS",
    lengthKey: "productDetail5LengthS",
  },
  {
    size: "M",
    chestKey: "productDetail5ChestM",
    lengthKey: "productDetail5LengthM",
  },
  {
    size: "L",
    chestKey: "productDetail5ChestL",
    lengthKey: "productDetail5LengthL",
  },
  {
    size: "XL",
    chestKey: "productDetail5ChestXl",
    lengthKey: "productDetail5LengthXl",
  },
  {
    size: "XXL",
    chestKey: "productDetail5ChestXxl",
    lengthKey: "productDetail5LengthXxl",
  },
];

export function SizeChartDialogProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [colorId, setColorId] = useState<string>(COLORS[0].id);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="border-border bg-surface relative aspect-[4/5] w-full overflow-hidden rounded-3xl border">
            <Image
              src={placeholderImage(IMAGE_SEEDS[activeIndex], "4x5")}
              alt={pd.productDetail5ImageAlt}
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
                aria-label={pd.productDetail5ThumbAria.replace(
                  "{n}",
                  String(index + 1),
                )}
                className="border-border data-[state=active]:ring-brand data-[state=active]:ring-offset-bg relative size-16 shrink-0 overflow-hidden rounded-lg border data-[state=active]:ring-2 data-[state=active]:ring-offset-2"
              >
                <Image
                  src={placeholderImage(seed, "4x5")}
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
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail5Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar
                size={14}
                className="text-warning"
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="text-fg font-medium">
                {pd.productDetail5RatingValue}
              </span>
              <span>{pd.productDetail5ReviewCount}</span>
            </div>
          </div>

          <span className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail5Price}
          </span>

          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">
              {pd.productDetail5ColorLabel}
              <span className="text-muted font-normal">
                {" — "}
                {
                  pd[
                    COLORS.find((color) => color.id === colorId)?.nameKey ??
                      COLORS[0].nameKey
                  ]
                }
              </span>
            </span>
            <div className="flex gap-2.5">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setColorId(color.id)}
                  data-state={colorId === color.id ? "active" : "inactive"}
                  aria-label={pd.productDetail5ColorSwatchAria.replace(
                    "{n}",
                    pd[color.nameKey],
                  )}
                  aria-pressed={colorId === color.id}
                  className="ring-offset-bg data-[state=active]:ring-brand size-8 rounded-full ring-1 ring-transparent ring-offset-2 transition-all data-[state=active]:ring-2"
                >
                  <span
                    className="border-border/50 block size-full rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-fg text-sm font-medium">
                {pd.productDetail5SizeLabel}
              </span>
              <Dialog>
                <DialogTrigger variant="link" size="sm">
                  {pd.productDetail5SizeGuideLabel}
                </DialogTrigger>
                <DialogContent size="md">
                  <DialogHeader>
                    <DialogTitle>
                      {pd.productDetail5SizeGuideDialogTitle}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {pd.productDetail5SizeGuideColSize}
                          </TableHead>
                          <TableHead>
                            {pd.productDetail5SizeGuideColChest}
                          </TableHead>
                          <TableHead>
                            {pd.productDetail5SizeGuideColLength}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SIZE_ROWS.map((row) => (
                          <TableRow key={row.size}>
                            <TableCell className="font-medium">
                              {row.size}
                            </TableCell>
                            <TableCell>{pd[row.chestKey]}</TableCell>
                            <TableCell>{pd[row.lengthKey]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DialogBody>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSize(label)}
                  data-state={size === label ? "active" : "inactive"}
                  className="data-[state=active]:bg-brand data-[state=active]:text-brand-fg data-[state=inactive]:bg-surface data-[state=inactive]:text-muted data-[state=inactive]:hover:bg-surface-hover h-9 min-w-9 rounded-lg px-2.5 text-xs font-medium transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ul className="text-muted flex flex-col gap-1.5 text-sm">
            <li>{pd.productDetail5CareNote1}</li>
            <li>{pd.productDetail5CareNote2}</li>
          </ul>

          <div className="text-muted flex items-center gap-2 text-xs">
            <IconRotate2 size={14} aria-hidden="true" />
            {pd.productDetail5ReturnsNote}
          </div>

          <div className="flex items-center gap-3">
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail5DecreaseAria}
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
                label={pd.productDetail5IncreaseAria}
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
              {pd.productDetail5AddToCart}
            </Button>
            <IconButton
              icon={<IconHeart size={18} aria-hidden="true" />}
              label={pd.productDetail5WishlistAria}
              variant="outline"
              size="icon"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
