"use client";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/cn";

interface CarouselContextValue { scrollPrev: () => void; scrollNext: () => void; canScrollPrev: boolean; canScrollNext: boolean; }
const CarouselContext = createContext<CarouselContextValue | null>(null);
export function useCarousel() { const ctx = useContext(CarouselContext); if (!ctx) throw new Error("useCarousel must be used within <Carousel>"); return ctx; }

export function Carousel({ className, children, opts, ...props }: React.ComponentPropsWithoutRef<"div"> & { opts?: Parameters<typeof useEmblaCarousel>[0] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const canScrollPrevRef = useRef(false);
  const canScrollNextRef = useRef(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    canScrollPrevRef.current = emblaApi.canScrollPrev();
    canScrollNextRef.current = emblaApi.canScrollNext();
    setCanScrollPrev(canScrollPrevRef.current);
    setCanScrollNext(canScrollNextRef.current);

    const onSelect = () => {
      const prev = emblaApi.canScrollPrev();
      const next = emblaApi.canScrollNext();
      canScrollPrevRef.current = prev;
      canScrollNextRef.current = next;
      setCanScrollPrev(prev);
      setCanScrollNext(next);
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => { emblaApi.off("select", onSelect); emblaApi.off("reInit", onSelect); };
  }, [emblaApi]);

  return (
    <CarouselContext.Provider value={{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <div className={cn("relative", className)} {...props}>
        <div ref={emblaRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex", className)} {...props} />;
}

export function CarouselItem({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("min-w-0 shrink-0 grow-0 basis-full", className)} {...props} />;
}

export function CarouselPrevious({ className, ...props }: React.ComponentPropsWithoutRef<"button">) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button disabled={!canScrollPrev} onClick={scrollPrev} className={cn("border-border bg-bg hover:bg-surface-hover absolute top-1/2 -left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-colors disabled:opacity-30", className)} {...props}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
    </button>
  );
}

export function CarouselNext({ className, ...props }: React.ComponentPropsWithoutRef<"button">) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button disabled={!canScrollNext} onClick={scrollNext} className={cn("border-border bg-bg hover:bg-surface-hover absolute top-1/2 -right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-colors disabled:opacity-30", className)} {...props}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
    </button>
  );
}
