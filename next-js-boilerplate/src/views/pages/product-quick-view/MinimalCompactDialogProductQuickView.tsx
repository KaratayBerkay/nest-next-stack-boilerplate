"use client";

import { useState } from "react";
import Image from "next/image";
import { IconCheck, IconShoppingCartPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductQuickViewMessages } from "@/types/pages/product-quick-view/ProductQuickViewMessages-types";

const CARD_SEED = "product-quick-view-2-card";

export function MinimalCompactDialogProductQuickView() {
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
      <div className="border-border bg-surface flex w-full max-w-xs items-center gap-3 rounded-xl border p-3 shadow-sm">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={placeholderImage(CARD_SEED, "1x1")}
            alt={p.productQuickView2ImageAlt}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-fg truncate text-sm font-semibold">
            {p.productQuickView2Name}
          </span>
          <span className="text-muted text-sm">{p.productQuickView2Price}</span>
        </div>
        <Dialog>
          <DialogTrigger
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
          >
            <IconShoppingCartPlus size={16} aria-hidden="true" />
            {p.productQuickView2Trigger}
          </DialogTrigger>
          <DialogContent size="sm" closeLabel={p.productQuickView2CloseLabel}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={placeholderImage(CARD_SEED, "1x1")}
                    alt={p.productQuickView2ImageAlt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-fg text-base font-semibold">
                    {p.productQuickView2Name}
                  </span>
                  <span className="text-muted text-sm">
                    {p.productQuickView2Price}
                  </span>
                </div>
              </div>
            </DialogHeader>
            <div className="px-6 pb-2">
              <p className="text-muted text-sm">
                {p.productQuickView2Description}
              </p>
            </div>
            <DialogFooter>
              {added ? (
                <span
                  role="status"
                  className="text-brand inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium"
                >
                  <IconCheck size={16} aria-hidden="true" />
                  {p.productQuickView2Added}
                </span>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleAddToCart}
                >
                  {p.productQuickView2AddToCart}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
