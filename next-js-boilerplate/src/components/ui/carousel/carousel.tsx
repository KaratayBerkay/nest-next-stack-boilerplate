"use client";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import {
  globalStyleVariants,
  type GlobalVariant,
} from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

interface CarouselContextValue {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
}
const carouselNavVariants = {
  ...globalStyleVariants,
  default: "border-border bg-bg",
};

const CarouselContext = createContext<CarouselContextValue | null>(null);
export function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within <Carousel>");
  return ctx;
}

export function Carousel({
  className,
  children,
  opts,
  onSelect: onSelectProp,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  opts?: Parameters<typeof useEmblaCarousel>[0];
  onSelect?: (index: number) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", onChange);
      emblaApi.on("reInit", onChange);
      return () => {
        emblaApi.off("select", onChange);
        emblaApi.off("reInit", onChange);
      };
    },
    [emblaApi],
  );
  const canScrollPrev = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false,
  );
  const canScrollNext = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollNext() ?? false,
    () => false,
  );
  const selectedIndex = useSyncExternalStore(
    subscribe,
    () => emblaApi?.selectedScrollSnap() ?? 0,
    () => 0,
  );

  useEffect(() => {
    if (!emblaApi || !onSelectProp) return;
    const onSelect = () => onSelectProp(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelectProp]);

  return (
    <CarouselContext.Provider
      value={{
        emblaRef,
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
      }}
    >
      <div className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({
  className,
  containerClassName,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { containerClassName?: string }) {
  const { emblaRef } = useCarousel();
  return (
    <div
      ref={emblaRef}
      className={cn("w-full overflow-hidden", containerClassName)}
    >
      <div className={cn("flex w-full", className)} {...props} />
    </div>
  );
}

export function CarouselItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  );
}

export function CarouselPrevious({
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { variant?: GlobalVariant }) {
  const effectiveVariant = useComponentVariant(variant);
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Previous slide"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      className={cn(
        "hover:bg-surface-hover bg-bg/80 absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors disabled:opacity-50",
        resolveVariant(carouselNavVariants, effectiveVariant),
        className,
      )}
      {...props}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}

export function CarouselNext({
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { variant?: GlobalVariant }) {
  const effectiveVariant = useComponentVariant(variant);
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Next slide"
      disabled={!canScrollNext}
      onClick={scrollNext}
      className={cn(
        "hover:bg-surface-hover bg-bg/80 absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors disabled:opacity-50",
        resolveVariant(carouselNavVariants, effectiveVariant),
        className,
      )}
      {...props}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}
