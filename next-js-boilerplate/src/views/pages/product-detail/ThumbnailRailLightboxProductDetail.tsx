"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconDiamond,
  IconDroplet,
  IconMinus,
  IconPlus,
  IconSettings,
  IconShieldCheck,
  IconShoppingBag,
  IconStar,
  IconZoomIn,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductDetailMessages } from "@/types/pages/product-detail/ProductDetailMessages-types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9;

const IMAGE_SEEDS = [
  "product-detail-4-watch-a",
  "product-detail-4-watch-b",
  "product-detail-4-watch-c",
  "product-detail-4-watch-d",
] as const;

interface FeatureItem {
  labelKey: string;
  icon: typeof IconShieldCheck;
}

const FEATURES: FeatureItem[] = [
  { labelKey: "productDetail4Feature1", icon: IconDroplet },
  { labelKey: "productDetail4Feature2", icon: IconDiamond },
  { labelKey: "productDetail4Feature3", icon: IconSettings },
  { labelKey: "productDetail4Feature4", icon: IconShieldCheck },
];

export function ThumbnailRailLightboxProductDetail() {
  const t = useMessages("pages") as unknown as PagesWithProductDetailMessages;
  const pd = t.productDetail;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <Dialog>
          <div className="flex flex-col-reverse gap-3 lg:flex-row">
            <div className="flex gap-3 lg:flex-col">
              {IMAGE_SEEDS.map((seed, index) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  data-state={activeIndex === index ? "active" : "inactive"}
                  aria-label={pd.productDetail4ThumbAria.replace(
                    "{n}",
                    String(index + 1),
                  )}
                  className="border-border data-[state=active]:ring-brand data-[state=active]:ring-offset-bg relative size-16 shrink-0 overflow-hidden rounded-lg border data-[state=active]:ring-2 data-[state=active]:ring-offset-2 lg:size-20"
                >
                  <Image
                    src={placeholderImage(seed, "1x1")}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="border-border bg-surface relative aspect-square w-full flex-1 overflow-hidden rounded-3xl border">
              <Image
                src={placeholderImage(IMAGE_SEEDS[activeIndex], "1x1")}
                alt={pd.productDetail4ImageAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <DialogTrigger
                variant="default"
                size="icon-sm"
                className="absolute right-3 bottom-3"
                aria-label={pd.productDetail4ExpandAria}
              >
                <IconZoomIn size={16} aria-hidden="true" />
              </DialogTrigger>
            </div>
          </div>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>{pd.productDetail4LightboxTitle}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="bg-surface relative aspect-square w-full overflow-hidden rounded-xl">
                <Image
                  src={placeholderImage(IMAGE_SEEDS[activeIndex], "1x1")}
                  alt={pd.productDetail4ImageAlt}
                  fill
                  sizes="90vw"
                  className="object-cover"
                />
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-brand text-xs font-semibold tracking-widest uppercase">
              {pd.productDetail4Eyebrow}
            </span>
            <h1 className="text-fg text-3xl font-semibold tracking-tight">
              {pd.productDetail4Name}
            </h1>
            <div className="text-muted flex items-center gap-1.5 text-sm">
              <IconStar
                size={14}
                className="text-warning"
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="text-fg font-medium">
                {pd.productDetail4RatingValue}
              </span>
              <span>{pd.productDetail4ReviewCount}</span>
            </div>
          </div>

          <span className="text-fg text-2xl font-semibold tracking-tight">
            {pd.productDetail4Price}
          </span>

          <p className="text-muted text-sm leading-relaxed">
            {pd.productDetail4Description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.labelKey}
                className="border-border bg-surface flex items-center gap-2 rounded-xl border p-3"
              >
                <feature.icon
                  size={16}
                  className="text-brand shrink-0"
                  aria-hidden="true"
                />
                <span className="text-fg text-xs font-medium">
                  {pd[feature.labelKey]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="border-border flex items-center gap-1 rounded-full border p-1">
              <IconButton
                icon={<IconMinus size={14} />}
                label={pd.productDetail4DecreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity <= MIN_QUANTITY}
                onClick={() =>
                  setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))
                }
              />
              <span className="text-fg w-6 text-center text-sm tabular-nums">
                {quantity}
              </span>
              <IconButton
                icon={<IconPlus size={14} />}
                label={pd.productDetail4IncreaseAria}
                variant="ghost"
                size="icon-xs"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() =>
                  setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
                }
              />
            </div>
            <Button variant="primary" className="flex-1">
              <IconShoppingBag size={16} aria-hidden="true" />
              {pd.productDetail4AddToCart}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
