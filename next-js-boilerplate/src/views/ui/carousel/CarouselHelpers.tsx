import { useCarousel } from "@/components/ui/Carousel";
import { cn } from "@/lib/cn";
import type { DotsProps, StarsProps } from "@/types/ui/CarouselComponent-types";

export function Stars({ rating }: StarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating) ? "fill-amber-400" : "fill-muted",
          )}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Dots({ total, className }: DotsProps) {
  const { selectedIndex, scrollTo } = useCarousel();
  return (
    <div className={cn("flex justify-center", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === selectedIndex || undefined}
          onClick={() => scrollTo(i)}
          className="group flex h-8 w-8 items-center justify-center"
        >
          <span
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === selectedIndex
                ? "bg-fg w-5"
                : "bg-fg/30 group-hover:bg-fg/50 w-2",
            )}
          />
        </button>
      ))}
    </div>
  );
}
