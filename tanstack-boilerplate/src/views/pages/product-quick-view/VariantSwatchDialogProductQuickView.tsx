"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconEye,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductQuickViewMessages } from "@/types/pages/product-quick-view/ProductQuickViewMessages-types";

const CARD_SEED = "product-quick-view-4-card";
const DIALOG_SEED = "product-quick-view-4-dialog";
const DEFAULT_COLOR_ID = "charcoal";
const DEFAULT_SIZE = "M";
const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;
const SIZES = ["XS", "S", "M", "L", "XL"] as const;

interface ColorOption {
  id: string;
  nameKey:
    | "productQuickView4Color1Name"
    | "productQuickView4Color2Name"
    | "productQuickView4Color3Name";
  hex: string;
}

const COLORS: ColorOption[] = [
  { id: "charcoal", nameKey: "productQuickView4Color1Name", hex: "#44403c" },
  { id: "sand", nameKey: "productQuickView4Color2Name", hex: "#d6c3a1" },
  { id: "sage", nameKey: "productQuickView4Color3Name", hex: "#94a583" },
];

export function VariantSwatchDialogProductQuickView() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithProductQuickViewMessages;
  const p = t.productQuickView;
  const [colorId, setColorId] = useState<string>(DEFAULT_COLOR_ID);
  const [size, setSize] = useState<string>(DEFAULT_SIZE);
  const [quantity, setQuantity] = useState<number>(DEFAULT_QUANTITY);
  const [added, setAdded] = useState(false);
  const selectedColor = COLORS.find((color) => color.id === colorId) ?? COLORS[0];

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="flex w-full items-center justify-center py-16 lg:py-24">
      <div className="border-border bg-surface w-full max-w-xs overflow-hidden rounded-2xl border shadow-sm">
        <div className="relative aspect-[4/5]">
          <Image
            src={placeholderImage(CARD_SEED, "4x5")}
            alt={p.productQuickView4ImageAlt}
            fill
            sizes="(min-width: 640px) 320px, 90vw"
            className="object-cover"
          />
          <Badge variant="soft" size="sm" className="absolute top-3 left-3">
            {p.productQuickView4CardBadge}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-fg text-sm font-semibold">
              {p.productQuickView4Name}
            </span>
            <span className="text-muted text-sm">
              {p.productQuickView4Price}
            </span>
          </div>
          <Dialog>
            <DialogTrigger variant="outline" size="sm" className="w-full gap-1.5">
              <IconEye size={16} aria-hidden="true" />
              {p.productQuickView4Trigger}
            </DialogTrigger>
            <DialogContent
              size="lg"
              closeLabel={p.productQuickView4CloseLabel}
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto sm:grid sm:grid-cols-2 sm:overflow-visible">
                <div className="bg-surface relative aspect-[4/5] shrink-0 sm:aspect-auto">
                  <Image
                    src={placeholderImage(DIALOG_SEED, "4x5")}
                    alt={p.productQuickView4ImageAlt}
                    fill
                    sizes="(min-width: 640px) 320px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-5 p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-fg text-lg font-semibold tracking-tight">
                      {p.productQuickView4Name}
                    </span>
                    <div className="text-muted flex items-center gap-1.5 text-sm">
                      <IconStar
                        size={14}
                        className="text-warning"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      <span className="text-fg font-medium">
                        {p.productQuickView4Rating}
                      </span>
                      <span>· {p.productQuickView4ReviewCount}</span>
                    </div>
                  </div>
                  <span className="text-fg text-2xl font-semibold tracking-tight">
                    {p.productQuickView4Price}
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="text-fg text-sm font-medium">
                      {p.productQuickView4ColorLabel} · {p[selectedColor.nameKey]}
                    </span>
                    <div className="flex gap-2.5">
                      {COLORS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          aria-label={`${p.productQuickView4SwatchAriaPrefix} ${p[color.nameKey]}`}
                          aria-pressed={colorId === color.id}
                          onClick={() => setColorId(color.id)}
                          style={{ backgroundColor: color.hex }}
                          className={cn(
                            "size-8 shrink-0 rounded-full border-2 transition-colors",
                            colorId === color.id
                              ? "border-brand"
                              : "border-border hover:border-brand/50",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-fg text-sm font-medium">
                      {p.productQuickView4SizeLabel}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SIZES.map((label) => (
                        <button
                          key={label}
                          type="button"
                          aria-label={`${p.productQuickView4SizeAriaPrefix} ${label}`}
                          aria-pressed={size === label}
                          onClick={() => setSize(label)}
                          data-state={size === label ? "active" : "inactive"}
                          className="data-[state=active]:bg-brand data-[state=active]:text-brand-fg data-[state=inactive]:bg-surface data-[state=inactive]:text-muted size-9 rounded-full text-xs font-medium transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-fg text-sm font-medium">
                      {p.productQuickView4QuantityLabel}
                    </span>
                    <Counter
                      value={quantity}
                      onChange={setQuantity}
                      min={MIN_QUANTITY}
                      max={MAX_QUANTITY}
                      label={p.productQuickView4Name}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose variant="ghost">
                  {p.productQuickView4Dismiss}
                </DialogClose>
                {added ? (
                  <span
                    role="status"
                    className="text-brand inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    <IconCheck size={16} aria-hidden="true" />
                    {p.productQuickView4Added}
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    leftIcon={<IconShoppingBag size={16} aria-hidden="true" />}
                    onClick={handleAddToCart}
                  >
                    {p.productQuickView4AddToCart}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
