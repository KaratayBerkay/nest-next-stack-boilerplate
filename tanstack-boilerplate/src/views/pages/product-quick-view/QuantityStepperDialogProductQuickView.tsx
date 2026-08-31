"use client";

import { useState } from "react";
import Image from "next/image";
import { IconCheck, IconShoppingBag } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductQuickViewMessages } from "@/types/pages/product-quick-view/ProductQuickViewMessages-types";

const CARD_SEED = "product-quick-view-3-card";
const DIALOG_SEED = "product-quick-view-3-dialog";
const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;

interface Spec {
  id: string;
  labelKey:
    | "productQuickView3Spec1Label"
    | "productQuickView3Spec2Label"
    | "productQuickView3Spec3Label";
  valueKey:
    | "productQuickView3Spec1Value"
    | "productQuickView3Spec2Value"
    | "productQuickView3Spec3Value";
}

const SPECS: Spec[] = [
  {
    id: "material",
    labelKey: "productQuickView3Spec1Label",
    valueKey: "productQuickView3Spec1Value",
  },
  {
    id: "fit",
    labelKey: "productQuickView3Spec2Label",
    valueKey: "productQuickView3Spec2Value",
  },
  {
    id: "care",
    labelKey: "productQuickView3Spec3Label",
    valueKey: "productQuickView3Spec3Value",
  },
];

export function QuantityStepperDialogProductQuickView() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithProductQuickViewMessages;
  const p = t.productQuickView;
  const [quantity, setQuantity] = useState<number>(DEFAULT_QUANTITY);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="flex w-full items-center justify-center py-16 lg:py-24">
      <div className="border-border bg-surface w-full max-w-xs overflow-hidden rounded-2xl border shadow-sm">
        <div className="relative aspect-square">
          <Image
            src={placeholderImage(CARD_SEED, "1x1")}
            alt={p.productQuickView3ImageAlt}
            fill
            sizes="(min-width: 640px) 320px, 90vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-fg text-sm font-semibold">
              {p.productQuickView3Name}
            </span>
            <span className="text-muted text-sm">
              {p.productQuickView3Price}
            </span>
          </div>
          <Dialog>
            <DialogTrigger
              variant="primary"
              size="sm"
              className="w-full gap-1.5"
            >
              <IconShoppingBag size={16} aria-hidden="true" />
              {p.productQuickView3AddToCart}
            </DialogTrigger>
            <DialogContent
              size="md"
              closeLabel={p.productQuickView3CloseLabel}
            >
              <DialogHeader>
                <DialogTitle>{p.productQuickView3Name}</DialogTitle>
                <DialogDescription>
                  {p.productQuickView3Tagline}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="flex flex-col gap-4">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                    <Image
                      src={placeholderImage(DIALOG_SEED, "16x9")}
                      alt={p.productQuickView3ImageAlt}
                      fill
                      sizes="(min-width: 640px) 448px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-muted text-sm">
                    {p.productQuickView3Description}
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    {SPECS.map((spec) => (
                      <div
                        key={spec.id}
                        className="border-border flex items-baseline justify-between gap-3 border-t pt-2 first:border-t-0 first:pt-0"
                      >
                        <span className="text-muted">{p[spec.labelKey]}</span>
                        <span className="text-fg text-right font-medium">
                          {p[spec.valueKey]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-fg text-sm font-medium">
                      {p.productQuickView3QuantityLabel}
                    </span>
                    <Counter
                      value={quantity}
                      onChange={setQuantity}
                      min={MIN_QUANTITY}
                      max={MAX_QUANTITY}
                      label={p.productQuickView3Name}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <DialogClose variant="ghost" size="sm">
                      {p.productQuickView3Dismiss}
                    </DialogClose>
                    {added ? (
                      <span
                        role="status"
                        className="text-brand inline-flex items-center gap-1.5 text-sm font-medium"
                      >
                        <IconCheck size={16} aria-hidden="true" />
                        {p.productQuickView3Added}
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={
                          <IconShoppingBag size={16} aria-hidden="true" />
                        }
                        onClick={handleAddToCart}
                      >
                        {p.productQuickView3AddToCart}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
