"use client";

import Image from "next/image";
import { IconShoppingBag } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const IMAGE_SEED = "product-detail-9-candle";

export function MinimalSingleColumnProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 text-center">
        <div className="border-border bg-surface relative aspect-square w-full overflow-hidden rounded-3xl border">
          <Image
            src={placeholderImage(IMAGE_SEED, "1x1")}
            alt={pd.productDetail9ImageAlt}
            fill
            sizes="(min-width: 1024px) 448px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail9Name}
          </h1>
          <span className="text-fg text-lg font-semibold tracking-tight">
            {pd.productDetail9Price}
          </span>
        </div>

        <p className="text-muted max-w-sm text-sm leading-relaxed">
          {pd.productDetail9Description}
        </p>

        <Separator className="w-12" />

        <Button variant="primary" size="lg" className="w-full max-w-xs">
          <IconShoppingBag size={16} aria-hidden="true" />
          {pd.productDetail9AddToCart}
        </Button>

        <span className="text-muted text-xs">{pd.productDetail9ShippingCaption}</span>
      </div>
    </section>
  );
}
