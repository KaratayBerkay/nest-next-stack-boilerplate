"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconRotate,
  IconShieldCheck,
  IconShoppingBag,
  IconTruck,
  IconZoomIn,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

const CARD_SEED = "product-quick-view-1-card";
const DIALOG_SEED = "product-quick-view-1-dialog";

interface Feature {
  id: string;
  icon: Icon;
  labelKey:
    | "productQuickView1Feature1"
    | "productQuickView1Feature2"
    | "productQuickView1Feature3";
}

const FEATURES: Feature[] = [
  { id: "shipping", icon: IconTruck, labelKey: "productQuickView1Feature1" },
  { id: "returns", icon: IconRotate, labelKey: "productQuickView1Feature2" },
  {
    id: "warranty",
    icon: IconShieldCheck,
    labelKey: "productQuickView1Feature3",
  },
];

export function StackedImageDialogProductQuickView() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithProductQuickViewMessages;
  const p = t.productQuickView;
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="flex w-full items-center justify-center py-16 lg:py-24">
      <div className="border-border bg-surface w-full max-w-xs overflow-hidden rounded-2xl border shadow-sm">
        <div className="relative aspect-[4/3]">
          <Image
            src={placeholderImage(CARD_SEED, "4x3")}
            alt={p.productQuickView1ImageAlt}
            fill
            sizes="(min-width: 640px) 320px, 90vw"
            className="object-cover"
          />
          <Badge variant="default" size="sm" className="absolute top-3 left-3">
            {p.productQuickView1CardBadge}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-fg text-sm font-semibold">
              {p.productQuickView1Name}
            </span>
            <span className="text-muted text-sm">
              {p.productQuickView1Price}
            </span>
          </div>
          <Dialog>
            <DialogTrigger
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
            >
              <IconZoomIn size={16} aria-hidden="true" />
              {p.productQuickView1Trigger}
            </DialogTrigger>
            <DialogContent size="md" closeLabel={p.productQuickView1CloseLabel}>
              <div className="relative aspect-[16/9] shrink-0 overflow-hidden">
                <Image
                  src={placeholderImage(DIALOG_SEED, "16x9")}
                  alt={p.productQuickView1ImageAlt}
                  fill
                  sizes="(min-width: 640px) 512px, 100vw"
                  className="object-cover"
                />
              </div>
              <DialogHeader>
                <DialogTitle>{p.productQuickView1Name}</DialogTitle>
                <DialogDescription>
                  {p.productQuickView1Blurb}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="flex flex-col gap-4">
                  <span className="text-fg text-2xl font-semibold tracking-tight">
                    {p.productQuickView1Price}
                  </span>
                  <ul className="flex flex-col gap-2">
                    {FEATURES.map((feature) => (
                      <li key={feature.id} className="flex items-center gap-2">
                        <feature.icon
                          size={16}
                          className="text-brand shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-fg text-sm">
                          {p[feature.labelKey]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </DialogBody>
              <DialogFooter>
                <DialogClose variant="ghost">
                  {p.productQuickView1Dismiss}
                </DialogClose>
                {added ? (
                  <span
                    role="status"
                    className="text-brand inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    <IconCheck size={16} aria-hidden="true" />
                    {p.productQuickView1Added}
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    leftIcon={<IconShoppingBag size={16} aria-hidden="true" />}
                    onClick={handleAddToCart}
                  >
                    {p.productQuickView1AddToCart}
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
