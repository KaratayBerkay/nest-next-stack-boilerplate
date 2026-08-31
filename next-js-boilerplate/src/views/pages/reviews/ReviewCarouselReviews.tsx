"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
} from "react";
import Image from "next/image";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

interface CarouselReview {
  id: string;
  rating: number;
  seed: string;
  nameKey: string;
  productKey: string;
  quoteKey: string;
}

// The Carousel primitive spreads native <div> props alongside a custom
// `onSelect(index: number)` prop, which TS intersects with the DOM
// `onSelect: ReactEventHandler<HTMLDivElement>` — a plain state setter
// can't satisfy both, so route through a small adapter like the other
// carousel variants in this codebase do.
function handleSelect(
  setSelectedIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
  };
}

const SLIDES: CarouselReview[] = [
  {
    id: "slide-1",
    rating: 5,
    seed: "reviews5-slide-1",
    nameKey: "reviews5Slide1Name",
    productKey: "reviews5Slide1Product",
    quoteKey: "reviews5Slide1Quote",
  },
  {
    id: "slide-2",
    rating: 4,
    seed: "reviews5-slide-2",
    nameKey: "reviews5Slide2Name",
    productKey: "reviews5Slide2Product",
    quoteKey: "reviews5Slide2Quote",
  },
  {
    id: "slide-3",
    rating: 5,
    seed: "reviews5-slide-3",
    nameKey: "reviews5Slide3Name",
    productKey: "reviews5Slide3Product",
    quoteKey: "reviews5Slide3Quote",
  },
  {
    id: "slide-4",
    rating: 5,
    seed: "reviews5-slide-4",
    nameKey: "reviews5Slide4Name",
    productKey: "reviews5Slide4Product",
    quoteKey: "reviews5Slide4Quote",
  },
  {
    id: "slide-5",
    rating: 4,
    seed: "reviews5-slide-5",
    nameKey: "reviews5Slide5Name",
    productKey: "reviews5Slide5Product",
    quoteKey: "reviews5Slide5Quote",
  },
  {
    id: "slide-6",
    rating: 5,
    seed: "reviews5-slide-6",
    nameKey: "reviews5Slide6Name",
    productKey: "reviews5Slide6Product",
    quoteKey: "reviews5Slide6Quote",
  },
];

export function ReviewCarouselReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;
  const [selected, setSelected] = useState(0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {rv.reviews5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {rv.reviews5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{rv.reviews5Intro}</p>
        </div>

        <Carousel
          className="mt-10"
          opts={{ loop: true }}
          onSelect={handleSelect(setSelected)}
          aria-label={rv.reviews5CarouselAria}
        >
          <CarouselContent>
            {SLIDES.map((slide) => (
              <CarouselItem key={slide.id}>
                <div className="border-border bg-surface mx-1 flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center lg:p-8">
                  <div className="border-border relative size-24 shrink-0 overflow-hidden rounded-xl border">
                    <Image
                      src={placeholderImage(slide.seed, "1x1")}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-0.5"
                      role="img"
                      aria-label={rv.reviews5RatingAriaTemplate
                        .replace("{name}", rv[slide.nameKey])
                        .replace("{rating}", String(slide.rating))}
                    >
                      {[1, 2, 3, 4, 5].map((n) =>
                        n <= slide.rating ? (
                          <IconStarFilled
                            key={n}
                            size={14}
                            aria-hidden="true"
                            className="text-warning"
                          />
                        ) : (
                          <IconStar
                            key={n}
                            size={14}
                            aria-hidden="true"
                            className="text-border"
                          />
                        ),
                      )}
                    </div>
                    <p className="text-fg text-base leading-relaxed font-medium">
                      {rv[slide.quoteKey]}
                    </p>
                    <p className="text-muted text-sm">
                      {rv[slide.nameKey]} · {rv[slide.productKey]}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="mt-6 flex justify-center gap-2">
          {SLIDES.map((slide, index) => (
            <span
              key={slide.id}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                index === selected ? "bg-brand" : "bg-border",
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
