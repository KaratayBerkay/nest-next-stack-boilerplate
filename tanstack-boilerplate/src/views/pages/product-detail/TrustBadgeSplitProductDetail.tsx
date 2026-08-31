"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconArrowBackUp,
  IconLock,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconStar,
  IconTruck,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;
const IMAGE_SEED = "product-detail-8-wallet";

interface TrustItem {
  icon: typeof IconTruck;
  labelKey: string;
  subKey: string;
}

const TRUST_ITEMS: TrustItem[] = [
  { icon: IconTruck, labelKey: "productDetail8TrustShippingLabel", subKey: "productDetail8TrustShippingSub" },
  { icon: IconArrowBackUp, labelKey: "productDetail8TrustReturnsLabel", subKey: "productDetail8TrustReturnsSub" },
  { icon: IconLock, labelKey: "productDetail8TrustSecureLabel", subKey: "productDetail8TrustSecureSub" },
];

export function TrustBadgeSplitProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="border-border bg-surface relative aspect-[4/5] w-full overflow-hidden rounded-3xl border">
          <Image
            src={placeholderImage(IMAGE_SEED, "4x5")}
            alt={pd.productDetail8ImageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              {pd.productDetail8Eyebrow}
            </span>
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail8Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar size={14} className="text-warning" fill="currentColor" aria-hidden="true" />
              <span className="text-fg font-medium">{pd.productDetail8RatingValue}</span>
              <span>{pd.productDetail8ReviewCount}</span>
            </div>
          </div>

          <span className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail8Price}
          </span>

          <p className="text-muted text-sm leading-relaxed">
            {pd.productDetail8Description}
          </p>

          <div className="flex items-center gap-3">
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail8DecreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity <= MIN_QUANTITY}
                onClick={() => setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))}
              />
              <span className="text-fg w-6 text-center text-sm tabular-nums">{quantity}</span>
              <IconButton
                icon={<IconPlus size={14} />}
                label={pd.productDetail8IncreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              />
            </div>
            <Button variant="primary" className="flex-1">
              <IconShoppingBag size={16} aria-hidden="true" />
              {pd.productDetail8AddToCart}
            </Button>
          </div>

          <div className="text-muted flex items-center gap-2 text-xs">
            <IconTruck size={14} aria-hidden="true" />
            {pd.productDetail8DeliveryEstimate}
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            {TRUST_ITEMS.map((item) => (
              <div key={item.labelKey} className="flex flex-col items-center gap-1.5 text-center">
                <item.icon size={20} className="text-brand" aria-hidden="true" />
                <span className="text-fg text-xs font-medium">{pd[item.labelKey]}</span>
                <span className="text-muted text-xs">{pd[item.subKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
