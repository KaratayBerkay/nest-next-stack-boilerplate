"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconInfoCircle,
  IconShoppingBag,
  IconX,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

const ADDED_TIMEOUT_MS = 1800;

interface ApplianceItem {
  id: string;
  nameKey: string;
  priceKey: string;
  spec1ValueKey: string;
  spec2ValueKey: string;
  spec3ValueKey: string;
  seed: string;
}

const ITEMS: ApplianceItem[] = [
  {
    id: "countertop-blender",
    nameKey: "productCard7Product1Name",
    priceKey: "productCard7Product1Price",
    spec1ValueKey: "productCard7Product1Spec1Value",
    spec2ValueKey: "productCard7Product1Spec2Value",
    spec3ValueKey: "productCard7Product1Spec3Value",
    seed: "product-card-7-blender",
  },
  {
    id: "hepa-air-purifier",
    nameKey: "productCard7Product2Name",
    priceKey: "productCard7Product2Price",
    spec1ValueKey: "productCard7Product2Spec1Value",
    spec2ValueKey: "productCard7Product2Spec2Value",
    spec3ValueKey: "productCard7Product2Spec3Value",
    seed: "product-card-7-air-purifier",
  },
  {
    id: "pour-over-coffee-maker",
    nameKey: "productCard7Product3Name",
    priceKey: "productCard7Product3Price",
    spec1ValueKey: "productCard7Product3Spec1Value",
    spec2ValueKey: "productCard7Product3Spec2Value",
    spec3ValueKey: "productCard7Product3Spec3Value",
    seed: "product-card-7-coffee-maker",
  },
];

function FlipCard({ item }: { item: ApplianceItem }) {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;
  const [flipped, setFlipped] = useState(false);
  const [added, setAdded] = useState(false);
  const name = p[item.nameKey];

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), ADDED_TIMEOUT_MS);
  }

  const specs = [
    { labelKey: "productCard7Spec1Label", valueKey: item.spec1ValueKey },
    { labelKey: "productCard7Spec2Label", valueKey: item.spec2ValueKey },
    { labelKey: "productCard7Spec3Label", valueKey: item.spec3ValueKey },
  ];

  return (
    <div className="border-border bg-bg overflow-hidden rounded-xl border shadow-xs">
      <div className="relative aspect-[4/5] [perspective:1200px]">
        <div
          className={cn(
            "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Image
              src={placeholderImage(item.seed, "4x5")}
              alt={name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
              <span className="text-sm font-medium text-white">{name}</span>
              <span className="text-xs text-white/85">{p[item.priceKey]}</span>
            </div>
            <IconButton
              icon={<IconInfoCircle size={16} aria-hidden="true" />}
              label={p.productCard7FlipToSpecsAriaTemplate.replace(
                "{name}",
                name,
              )}
              variant="default"
              size="icon-sm"
              className="absolute top-2 right-2"
              onClick={() => setFlipped(true)}
            />
          </div>

          <div className="border-border bg-surface absolute inset-0 flex [transform:rotateY(180deg)] flex-col justify-between border p-4 [backface-visibility:hidden]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-fg text-sm font-medium">{name}</span>
              <IconButton
                icon={<IconX size={15} aria-hidden="true" />}
                label={p.productCard7FlipToFrontAriaTemplate.replace(
                  "{name}",
                  name,
                )}
                variant="ghost"
                size="icon-sm"
                onClick={() => setFlipped(false)}
              />
            </div>
            <dl className="flex flex-col gap-2 text-sm">
              {specs.map((spec) => (
                <div
                  key={spec.labelKey}
                  className="border-border flex items-baseline justify-between gap-3 border-t pt-2 first:border-t-0 first:pt-0"
                >
                  <dt className="text-muted">{p[spec.labelKey]}</dt>
                  <dd className="text-fg text-right font-medium">
                    {p[spec.valueKey]}
                  </dd>
                </div>
              ))}
            </dl>
            <Button
              variant={added ? "soft" : "primary"}
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <IconCheck size={14} aria-hidden="true" />
                  {p.productCard7AddedLabel}
                </>
              ) : (
                <>
                  <IconShoppingBag size={14} aria-hidden="true" />
                  {p.productCard7AddToCartLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlipSpecCardProductCard() {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {p.productCard7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.productCard7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{p.productCard7Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <FlipCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
