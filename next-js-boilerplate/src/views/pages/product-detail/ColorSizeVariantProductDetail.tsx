"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconHeart,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const STOCK_LEFT = 4;
const STOCK_TOTAL = 20;

interface ColorOption {
  id: string;
  nameKey: string;
  hex: string;
  seed: string;
}

const COLORS: ColorOption[] = [
  {
    id: "storm-grey",
    nameKey: "productDetail3Color1",
    hex: "#6b7280",
    seed: "product-detail-3-jacket-grey",
  },
  {
    id: "forest-green",
    nameKey: "productDetail3Color2",
    hex: "#2f5233",
    seed: "product-detail-3-jacket-green",
  },
  {
    id: "onyx-black",
    nameKey: "productDetail3Color3",
    hex: "#1c1c1e",
    seed: "product-detail-3-jacket-black",
  },
  {
    id: "sandstone",
    nameKey: "productDetail3Color4",
    hex: "#c2a878",
    seed: "product-detail-3-jacket-sand",
  },
];

export function ColorSizeVariantProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;

  const [colorId, setColorId] = useState<string>(COLORS[0].id);
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);
  const activeColor = COLORS.find((color) => color.id === colorId) ?? COLORS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="border-border bg-surface relative aspect-[4/5] w-full overflow-hidden rounded-3xl border">
            <Image
              src={placeholderImage(activeColor.seed, "4x5")}
              alt={pd.productDetail3ImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex gap-3">
            {COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setColorId(color.id)}
                data-state={colorId === color.id ? "active" : "inactive"}
                aria-label={pd.productDetail3ThumbAria.replace(
                  "{n}",
                  pd[color.nameKey],
                )}
                className="border-border data-[state=active]:ring-brand data-[state=active]:ring-offset-bg relative size-16 shrink-0 overflow-hidden rounded-lg border data-[state=active]:ring-2 data-[state=active]:ring-offset-2"
              >
                <Image
                  src={placeholderImage(color.seed, "4x5")}
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
              {pd.productDetail3Eyebrow}
            </span>
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail3Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar
                size={14}
                className="text-warning"
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="text-fg font-medium">
                {pd.productDetail3RatingValue}
              </span>
              <span>{pd.productDetail3ReviewCount}</span>
            </div>
          </div>

          <span className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail3Price}
          </span>

          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">
              {pd.productDetail3ColorLabel}
              <span className="text-muted font-normal">
                {" "}
                — {pd[activeColor.nameKey]}
              </span>
            </span>
            <div className="flex gap-2.5">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setColorId(color.id)}
                  data-state={colorId === color.id ? "active" : "inactive"}
                  aria-label={pd.productDetail3ColorSwatchAria.replace(
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
            <span className="text-fg text-sm font-medium">
              {pd.productDetail3SizeLabel}
            </span>
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

          <div className="flex flex-col gap-1.5">
            <Progress value={(STOCK_LEFT / STOCK_TOTAL) * 100} size="sm" />
            <span className="text-warning text-xs font-medium">
              {pd.productDetail3StockLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail3DecreaseAria}
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
                label={pd.productDetail3IncreaseAria}
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
              {pd.productDetail3AddToCart}
            </Button>
            <IconButton
              icon={<IconHeart size={18} aria-hidden="true" />}
              label={pd.productDetail3WishlistAria}
              variant="outline"
              size="icon"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
