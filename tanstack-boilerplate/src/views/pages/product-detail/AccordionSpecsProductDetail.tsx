"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconChevronDown,
  IconHeart,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconStar,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;
const IMAGE_SEED = "product-detail-1-trailpack";

interface SpecRow {
  labelKey: string;
  valueKey: string;
}

interface SpecCategory {
  id: string;
  titleKey: string;
  rows: SpecRow[];
}

const CATEGORIES: SpecCategory[] = [
  {
    id: "build",
    titleKey: "productDetail1CatBuildTitle",
    rows: [
      { labelKey: "productDetail1BuildRow1Label", valueKey: "productDetail1BuildRow1Value" },
      { labelKey: "productDetail1BuildRow2Label", valueKey: "productDetail1BuildRow2Value" },
      { labelKey: "productDetail1BuildRow3Label", valueKey: "productDetail1BuildRow3Value" },
    ],
  },
  {
    id: "fit",
    titleKey: "productDetail1CatFitTitle",
    rows: [
      { labelKey: "productDetail1FitRow1Label", valueKey: "productDetail1FitRow1Value" },
      { labelKey: "productDetail1FitRow2Label", valueKey: "productDetail1FitRow2Value" },
      { labelKey: "productDetail1FitRow3Label", valueKey: "productDetail1FitRow3Value" },
    ],
  },
  {
    id: "care",
    titleKey: "productDetail1CatCareTitle",
    rows: [
      { labelKey: "productDetail1CareRow1Label", valueKey: "productDetail1CareRow1Value" },
      { labelKey: "productDetail1CareRow2Label", valueKey: "productDetail1CareRow2Value" },
      { labelKey: "productDetail1CareRow3Label", valueKey: "productDetail1CareRow3Value" },
    ],
  },
];

export function AccordionSpecsProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="border-border bg-surface relative aspect-[4/5] w-full overflow-hidden rounded-3xl border">
          <Image
            src={placeholderImage(IMAGE_SEED, "4x5")}
            alt={pd.productDetail1ImageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              {pd.productDetail1Eyebrow}
            </span>
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail1Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar size={14} className="text-warning" fill="currentColor" aria-hidden="true" />
              <span className="text-fg font-medium">{pd.productDetail1RatingValue}</span>
              <span>{pd.productDetail1ReviewCount}</span>
            </div>
          </div>

          <span className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail1Price}
          </span>

          <p className="text-muted text-sm leading-relaxed">
            {pd.productDetail1Description}
          </p>

          <div className="border-border overflow-hidden rounded-2xl border">
            <Accordion type="single" collapsible defaultValue="build">
              {CATEGORIES.map((category) => (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="group">
                    <span>{pd[category.titleKey]}</span>
                    <IconChevronDown
                      size={16}
                      aria-hidden="true"
                      className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    <dl className="flex flex-col gap-2">
                      {category.rows.map((row) => (
                        <div key={row.labelKey} className="flex items-center justify-between gap-4 text-sm">
                          <dt className="text-muted">{pd[row.labelKey]}</dt>
                          <dd className="text-fg font-medium">{pd[row.valueKey]}</dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="flex items-center gap-3">
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail1DecreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity <= MIN_QUANTITY}
                onClick={() => setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))}
              />
              <span className="text-fg w-6 text-center text-sm tabular-nums">{quantity}</span>
              <IconButton
                icon={<IconPlus size={14} />}
                label={pd.productDetail1IncreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              />
            </div>
            <Button variant="primary" className="flex-1">
              <IconShoppingBag size={16} aria-hidden="true" />
              {pd.productDetail1AddToCart}
            </Button>
            <IconButton
              icon={<IconHeart size={18} aria-hidden="true" />}
              label={pd.productDetail1WishlistAria}
              variant="outline"
              size="icon"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
