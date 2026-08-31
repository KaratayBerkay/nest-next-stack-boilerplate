import {
  type PointerEvent as ReactPointerEvent,
  type MutableRefObject,
  type RefObject,
} from "react";
import { cn } from "@/lib/cn";

export const cssSlides = [
  {
    title: "Mountain Retreat",
    description: "Escape to serenity in the Swiss Alps",
    gradient: "from-emerald-800 to-teal-900",
  },
  {
    title: "Coastal Sunrise",
    description: "Golden light over the Pacific coast",
    gradient: "from-amber-700 to-orange-800",
  },
  {
    title: "Urban Nights",
    description: "City lights and skyline reflections",
    gradient: "from-indigo-800 to-violet-900",
  },
  {
    title: "Desert Dunes",
    description: "Endless waves of sand at dusk",
    gradient: "from-rose-800 to-red-900",
  },
  {
    title: "Forest Canopy",
    description: "Sunlight filtering through ancient trees",
    gradient: "from-green-800 to-emerald-900",
  },
];

export const AUTOPLAY_INTERVAL = 4000;

export function onPointerDownModuleLevel(
  e: ReactPointerEvent<HTMLDivElement>,
  scrollRef: RefObject<HTMLDivElement | null>,
  dragRef: MutableRefObject<{ startX: number; startScroll: number } | null>,
  markInteraction: () => void,
) {
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  const el = scrollRef.current;
  if (!el) return;
  e.preventDefault();
  markInteraction();
  dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft };
  el.setPointerCapture(e.pointerId);
  el.style.scrollSnapType = "none";
  el.style.scrollBehavior = "auto";
}

export function onPointerMoveModuleLevel(
  e: ReactPointerEvent<HTMLDivElement>,
  dragRef: MutableRefObject<{ startX: number; startScroll: number } | null>,
  scrollRef: RefObject<HTMLDivElement | null>,
  markInteraction: () => void,
) {
  const drag = dragRef.current;
  const el = scrollRef.current;
  if (!drag || !el) return;
  markInteraction();
  el.scrollLeft = drag.startScroll - (e.clientX - drag.startX);
}

export function endDragModuleLevel(
  dragRef: MutableRefObject<{ startX: number; startScroll: number } | null>,
  scrollRef: RefObject<HTMLDivElement | null>,
  markInteraction: () => void,
  getStride: (el: HTMLDivElement) => number,
  restoreSnap: (el: HTMLDivElement) => void,
) {
  const drag = dragRef.current;
  const el = scrollRef.current;
  if (!drag || !el) return;
  dragRef.current = null;
  markInteraction();
  const stride = getStride(el);
  const index = Math.min(
    cssSlides.length - 1,
    Math.max(0, Math.round(el.scrollLeft / stride)),
  );
  el.scrollTo({ left: stride * index, behavior: "smooth" });
  restoreSnap(el);
}

export function PureCssDots({
  activeIndex,
  scrollTo,
}: {
  activeIndex: number;
  scrollTo: (index: number) => void;
}) {
  return (
    <div className="mt-2 flex justify-center">
      {cssSlides.map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === activeIndex || undefined}
          onClick={() => scrollTo(i)}
          className="group flex h-8 w-8 items-center justify-center"
        >
          <span
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === activeIndex
                ? "bg-fg w-5"
                : "bg-fg/30 group-hover:bg-fg/50 w-2",
            )}
          />
        </button>
      ))}
    </div>
  );
}
