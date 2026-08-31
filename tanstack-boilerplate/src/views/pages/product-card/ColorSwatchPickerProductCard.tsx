"use client";

import { useState } from "react";
import Image from "next/image";
import { IconCheck, IconShoppingBag } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

const ADDED_TIMEOUT_MS = 1800;

type ColorNameKey =
  | "productCard2ColorBlackName"
  | "productCard2ColorWhiteName"
  | "productCard2ColorSandName"
  | "productCard2ColorSageName"
  | "productCard2ColorRustName"
  | "productCard2ColorNavyName";

interface ColorOption {
  id: string;
  nameKey: ColorNameKey;
  hex: string;
}

const COLOR_BLACK: ColorOption = {
  id: "black",
  nameKey: "productCard2ColorBlackName",
  hex: "#1c1917",
};
const COLOR_WHITE: ColorOption = {
  id: "white",
  nameKey: "productCard2ColorWhiteName",
  hex: "#fafaf9",
};
const COLOR_SAND: ColorOption = {
  id: "sand",
  nameKey: "productCard2ColorSandName",
  hex: "#d9c7a3",
};
const COLOR_SAGE: ColorOption = {
  id: "sage",
  nameKey: "productCard2ColorSageName",
  hex: "#94a583",
};
const COLOR_RUST: ColorOption = {
  id: "rust",
  nameKey: "productCard2ColorRustName",
  hex: "#b5502f",
};
const COLOR_NAVY: ColorOption = {
  id: "navy",
  nameKey: "productCard2ColorNavyName",
  hex: "#1e3a5f",
};

interface ApparelItem {
  id: string;
  nameKey: string;
  priceKey: string;
  seed: string;
  colors: ColorOption[];
}

const ITEMS: ApparelItem[] = [
  {
    id: "everyday-crew-tee",
    nameKey: "productCard2Product1Name",
    priceKey: "productCard2Product1Price",
    seed: "product-card-2-crew-tee",
    colors: [COLOR_BLACK, COLOR_WHITE, COLOR_RUST],
  },
  {
    id: "fleece-pullover-hoodie",
    nameKey: "productCard2Product2Name",
    priceKey: "productCard2Product2Price",
    seed: "product-card-2-pullover-hoodie",
    colors: [COLOR_SAND, COLOR_SAGE, COLOR_NAVY],
  },
  {
    id: "canvas-weekender-tote",
    nameKey: "productCard2Product3Name",
    priceKey: "productCard2Product3Price",
    seed: "product-card-2-weekender-tote",
    colors: [COLOR_BLACK, COLOR_SAND, COLOR_SAGE],
  },
];

function SwatchCard({ item }: { item: ApparelItem }) {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;
  const [colorId, setColorId] = useState<string>(item.colors[0].id);
  const [added, setAdded] = useState(false);
  const selectedColor =
    item.colors.find((color) => color.id === colorId) ?? item.colors[0];
  const name = p[item.nameKey];
  const colorName = p[selectedColor.nameKey];

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), ADDED_TIMEOUT_MS);
  }

  return (
    <Card variant="default">
      <div className="flex flex-col">
        <div className="bg-surface relative aspect-[4/5] overflow-hidden rounded-t-xl">
          <Image
            src={placeholderImage(`${item.seed}-${colorId}`, "4x5")}
            alt={p.productCard2ImageAltTemplate
              .replace("{product}", name)
              .replace("{color}", colorName)}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2.5 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-fg text-sm font-medium">{name}</span>
            <span className="text-fg text-sm font-semibold">
              {p[item.priceKey]}
            </span>
          </div>
          <span className="text-muted text-xs">
            {p.productCard2ColorLabelPrefix} {colorName}
          </span>
          <div className="flex gap-2">
            {item.colors.map((color) => {
              const label = p[color.nameKey];
              const isActive = color.id === colorId;
              return (
                <button
                  key={color.id}
                  type="button"
                  aria-label={p.productCard2SwatchAriaTemplate
                    .replace("{color}", label)
                    .replace("{product}", name)}
                  aria-pressed={isActive}
                  onClick={() => setColorId(color.id)}
                  style={{ backgroundColor: color.hex }}
                  className={cn(
                    "size-7 shrink-0 rounded-full border-2 transition-colors",
                    isActive
                      ? "border-brand"
                      : "border-border hover:border-brand/50",
                  )}
                />
              );
            })}
          </div>
          <Button
            variant={added ? "soft" : "primary"}
            size="sm"
            className="mt-1 w-full"
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <IconCheck size={14} aria-hidden="true" />
                {p.productCard2AddedLabel}
              </>
            ) : (
              <>
                <IconShoppingBag size={14} aria-hidden="true" />
                {p.productCard2AddToCartLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ColorSwatchPickerProductCard() {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {p.productCard2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.productCard2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{p.productCard2Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <SwatchCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
