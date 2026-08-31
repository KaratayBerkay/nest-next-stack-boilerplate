"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconEye,
  IconShoppingBag,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductQuickViewMessages } from "@/types/pages/product-quick-view/ProductQuickViewMessages-types";

const CARD_SEED = "product-quick-view-5-card";
const RATING_FILLED_STARS = 4;
const STAR_COUNT = 5;
const STARS = Array.from({ length: STAR_COUNT }, (_, index) => index);
const DEFAULT_IMAGE_INDEX = 0;

interface GalleryImage {
  id: string;
  seed: string;
}

const IMAGES: GalleryImage[] = [
  { id: "front", seed: "product-quick-view-5-thumb-front" },
  { id: "side", seed: "product-quick-view-5-thumb-side" },
  { id: "back", seed: "product-quick-view-5-thumb-back" },
  { id: "detail", seed: "product-quick-view-5-thumb-detail" },
];

export function ThumbnailGalleryDialogProductQuickView() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithProductQuickViewMessages;
  const p = t.productQuickView;
  const [imageIndex, setImageIndex] = useState<number>(DEFAULT_IMAGE_INDEX);
  const [added, setAdded] = useState(false);
  const activeImage = IMAGES[imageIndex] ?? IMAGES[0];

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="flex w-full items-center justify-center py-16 lg:py-24">
      <div className="border-border bg-surface w-full max-w-xs overflow-hidden rounded-2xl border shadow-sm">
        <div className="relative aspect-[4/5]">
          <Image
            src={placeholderImage(CARD_SEED, "4x5")}
            alt={p.productQuickView5ImageAlt}
            fill
            sizes="(min-width: 640px) 320px, 90vw"
            className="object-cover"
          />
          <Badge variant="soft" size="sm" className="absolute top-3 left-3">
            {p.productQuickView5CardBadge}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-fg text-sm font-semibold">
              {p.productQuickView5Name}
            </span>
            <span className="text-muted text-sm">
              {p.productQuickView5Price}
            </span>
          </div>
          <Dialog>
            <DialogTrigger
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
            >
              <IconEye size={16} aria-hidden="true" />
              {p.productQuickView5Trigger}
            </DialogTrigger>
            <DialogContent
              size="md"
              closeLabel={p.productQuickView5CloseLabel}
            >
              <div className="flex flex-col gap-4 p-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={placeholderImage(activeImage.seed, "4x3")}
                    alt={p.productQuickView5ImageAlt}
                    fill
                    sizes="(min-width: 640px) 448px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  {IMAGES.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      aria-label={`${p.productQuickView5ThumbnailAriaPrefix} ${index + 1}`}
                      aria-pressed={imageIndex === index}
                      onClick={() => setImageIndex(index)}
                      data-state={imageIndex === index ? "active" : "inactive"}
                      className="data-[state=active]:border-brand data-[state=inactive]:border-border relative aspect-square w-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors"
                    >
                      <Image
                        src={placeholderImage(image.seed, "1x1")}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-fg text-lg font-semibold tracking-tight">
                    {p.productQuickView5Name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5" aria-hidden="true">
                      {STARS.map((star) =>
                        star < RATING_FILLED_STARS ? (
                          <IconStarFilled
                            key={star}
                            size={14}
                            className="text-warning"
                          />
                        ) : (
                          <IconStar
                            key={star}
                            size={14}
                            className="text-muted"
                          />
                        ),
                      )}
                    </div>
                    <span className="text-fg text-sm font-medium">
                      {p.productQuickView5Rating}
                    </span>
                    <span className="text-muted text-sm">
                      · {p.productQuickView5ReviewCount}
                    </span>
                  </div>
                </div>
                <span className="text-fg text-2xl font-semibold tracking-tight">
                  {p.productQuickView5Price}
                </span>
              </div>
              <DialogFooter>
                <DialogClose variant="ghost">
                  {p.productQuickView5Dismiss}
                </DialogClose>
                {added ? (
                  <span
                    role="status"
                    className="text-brand inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    <IconCheck size={16} aria-hidden="true" />
                    {p.productQuickView5Added}
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    leftIcon={<IconShoppingBag size={16} aria-hidden="true" />}
                    onClick={handleAddToCart}
                  >
                    {p.productQuickView5AddToCart}
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
