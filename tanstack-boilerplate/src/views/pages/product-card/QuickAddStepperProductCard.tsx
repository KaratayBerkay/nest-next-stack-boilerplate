"use client";

import { useState } from "react";
import Image from "next/image";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Counter } from "@/components/ui/Counter";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductCardMessages } from "@/types/pages/product-card/ProductCardMessages-types";

const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 12;

interface PantryItem {
  id: string;
  nameKey: string;
  priceKey: string;
  seed: string;
}

const ITEMS: PantryItem[] = [
  {
    id: "single-origin-coffee",
    nameKey: "productCard3Product1Name",
    priceKey: "productCard3Product1Price",
    seed: "product-card-3-coffee-beans",
  },
  {
    id: "cold-pressed-olive-oil",
    nameKey: "productCard3Product2Name",
    priceKey: "productCard3Product2Price",
    seed: "product-card-3-olive-oil",
  },
  {
    id: "oat-honey-granola",
    nameKey: "productCard3Product3Name",
    priceKey: "productCard3Product3Price",
    seed: "product-card-3-granola",
  },
  {
    id: "wildflower-honey-jar",
    nameKey: "productCard3Product4Name",
    priceKey: "productCard3Product4Price",
    seed: "product-card-3-honey-jar",
  },
];

function StepperCard({ item }: { item: PantryItem }) {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState<number>(DEFAULT_QUANTITY);
  const name = p[item.nameKey];

  function handleAdd() {
    setInCart(true);
    setQuantity(DEFAULT_QUANTITY);
  }

  function handleRemove() {
    setInCart(false);
    setQuantity(DEFAULT_QUANTITY);
  }

  return (
    <Card variant="default">
      <div className="flex flex-col">
        <div className="bg-surface relative aspect-square overflow-hidden rounded-t-xl">
          <Image
            src={placeholderImage(item.seed, "1x1")}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2.5 p-4">
          <span className="text-fg text-sm font-medium">{name}</span>
          <span className="text-fg text-base font-semibold tracking-tight">
            {p[item.priceKey]}
          </span>
          {inCart ? (
            <div className="mt-1 flex items-center justify-between gap-2">
              <Counter
                value={quantity}
                onChange={setQuantity}
                min={MIN_QUANTITY}
                max={MAX_QUANTITY}
                label={p.productCard3QuantityAriaTemplate.replace(
                  "{name}",
                  name,
                )}
              />
              <IconButton
                icon={<IconTrash size={15} aria-hidden="true" />}
                label={p.productCard3RemoveAriaTemplate.replace("{name}", name)}
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
              />
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="mt-1 w-full"
              onClick={handleAdd}
            >
              <IconPlus size={14} aria-hidden="true" />
              {p.productCard3AddLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function QuickAddStepperProductCard() {
  const t = useMessages("pages") as unknown as PagesWithProductCardMessages;
  const p = t.productCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {p.productCard3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.productCard3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{p.productCard3Intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <StepperCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
