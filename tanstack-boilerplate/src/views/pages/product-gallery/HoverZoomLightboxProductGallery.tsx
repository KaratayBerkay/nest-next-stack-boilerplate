"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight, IconMaximize } from "@tabler/icons-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductGalleryMessages } from "@/types/pages/product-gallery/ProductGalleryMessages-types";

const PRICE = 248;
const usd = (n: number) => `$${n.toFixed(2)}`;
// Same chip look CarouselPrevious/CarouselNext use for their nav buttons —
// reused verbatim here so custom overlay controls match the primitive.
const overlayButtonClass =
  "hover:bg-surface-hover bg-bg/80 border-border absolute z-10 flex size-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors";

interface GalleryImage {
  id: string;
  seed: string;
  angleKey: string;
}

const IMAGES: GalleryImage[] = [
  { id: "img-1", seed: "pg2-front", angleKey: "productGallery2Angle1" },
  { id: "img-2", seed: "pg2-interior", angleKey: "productGallery2Angle2" },
  { id: "img-3", seed: "pg2-handle", angleKey: "productGallery2Angle3" },
  { id: "img-4", seed: "pg2-packed", angleKey: "productGallery2Angle4" },
];

export function HoverZoomLightboxProductGallery() {
  const t = useMessages("pages") as unknown as PagesWithProductGalleryMessages;
  const pg = t.productGallery;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = IMAGES[activeIndex];

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + IMAGES.length) % IMAGES.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % IMAGES.length);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {pg.productGallery2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {pg.productGallery2Heading}
          </h2>
          <p className="text-muted max-w-xl">{pg.productGallery2Description}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div
              className="border-border bg-surface relative aspect-square cursor-crosshair overflow-hidden rounded-2xl border"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZooming(true)}
              onMouseLeave={() => setZooming(false)}
            >
              <Image
                src={placeholderImage(current.seed, "1x1")}
                alt={pg[current.angleKey]}
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={goPrev}
                aria-label={pg.productGallery2PrevAria}
                className={cn(overlayButtonClass, "top-1/2 left-3 -translate-y-1/2")}
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={pg.productGallery2NextAria}
                className={cn(overlayButtonClass, "top-1/2 right-3 -translate-y-1/2")}
              >
                <IconChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={pg.productGallery2OpenAria}
                className={cn(overlayButtonClass, "top-3 right-3")}
              >
                <IconMaximize size={16} />
              </button>
            </div>
            <span className="text-muted text-sm">{pg[current.angleKey]}</span>
          </div>

          <div className="border-border bg-surface relative hidden aspect-square overflow-hidden rounded-2xl border lg:block">
            {zooming ? (
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${placeholderImage(current.seed, "1x1")})`,
                  backgroundSize: "200%",
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundRepeat: "no-repeat",
                }}
              />
            ) : (
              <div className="text-muted flex h-full items-center justify-center p-6 text-center text-sm">
                {pg.productGallery2ZoomHint}
              </div>
            )}
          </div>
        </div>

        <div className="border-border mt-8 flex items-center justify-between gap-4 border-t pt-6">
          <span className="text-fg text-lg font-semibold">
            {pg.productGallery2ProductName}
          </span>
          <span className="text-fg text-lg font-semibold tabular-nums">
            {usd(PRICE)}
          </span>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent size="lg" closeLabel={pg.productGallery2CloseLabel}>
          <DialogHeader>
            <DialogTitle>{pg.productGallery2LightboxTitle}</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <div className="bg-surface relative aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={placeholderImage(current.seed, "1x1")}
                alt={pg[current.angleKey]}
                fill
                sizes="(min-width: 640px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              {IMAGES.map((image, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-current={active ? "true" : undefined}
                    aria-label={`${pg.productGallery2ThumbAriaPrefix} ${pg[image.angleKey]}`}
                    className={cn(
                      "border-border relative size-16 shrink-0 overflow-hidden rounded-lg border",
                      active
                        ? "ring-brand ring-offset-bg ring-2 ring-offset-2"
                        : "hover:border-fg/30",
                    )}
                  >
                    <Image
                      src={placeholderImage(image.seed, "1x1")}
                      alt={pg[image.angleKey]}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </section>
  );
}
