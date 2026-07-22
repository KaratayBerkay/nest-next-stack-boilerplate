import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import {
  cssSlides,
  AUTOPLAY_INTERVAL,
  onPointerDownModuleLevel,
  onPointerMoveModuleLevel,
  endDragModuleLevel,
  PureCssDots,
} from "@/views/ui/carousel/PureCssCarouselHelpers";

export function PureCssCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef<{ startX: number; startScroll: number } | null>(null);
  const lastInteractionRef = useRef(0);

  const getStride = useCallback((el: HTMLDivElement) => {
    const first = el.children[0] as HTMLElement | undefined;
    const second = el.children[1] as HTMLElement | undefined;
    return first && second
      ? second.offsetLeft - first.offsetLeft
      : el.scrollWidth;
  }, []);

  const markInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / getStride(el));
    setActiveIndex(Math.min(cssSlides.length - 1, Math.max(0, index)));
  }, [getStride]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  const scrollTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      markInteraction();
      el.scrollTo({ left: getStride(el) * index, behavior: "smooth" });
    },
    [getStride, markInteraction],
  );

  useEffect(() => {
    if (hovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (Date.now() - lastInteractionRef.current < AUTOPLAY_INTERVAL) return;
      const stride = getStride(el);
      const next = (Math.round(el.scrollLeft / stride) + 1) % cssSlides.length;
      el.scrollTo({ left: stride * next, behavior: "smooth" });
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [hovered, getStride]);

  const restoreSnap = useCallback((el: HTMLDivElement) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener("scrollend", finish);
      el.style.scrollSnapType = "";
      el.style.scrollBehavior = "";
    };
    el.addEventListener("scrollend", finish);
    window.setTimeout(finish, 700);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) =>
      onPointerDownModuleLevel(e, scrollRef, dragRef, markInteraction),
    [markInteraction],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) =>
      onPointerMoveModuleLevel(e, dragRef, scrollRef, markInteraction),
    [markInteraction],
  );

  const endDrag = useCallback(
    () =>
      endDragModuleLevel(
        dragRef,
        scrollRef,
        markInteraction,
        getStride,
        restoreSnap,
      ),
    [markInteraction, getStride, restoreSnap],
  );

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onTouchStart={markInteraction}
        onTouchMove={markInteraction}
        onWheel={markInteraction}
        className="flex w-full cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-xl select-none active:cursor-grabbing"
        style={{ scrollbarWidth: "none" }}
      >
        {cssSlides.map((slide, i) => (
          <div key={i} className="w-full shrink-0 snap-center">
            <div
              className={cn(
                "relative flex h-64 w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br p-8 text-center sm:h-80 lg:h-[min(24rem,55vh)]",
                slide.gradient,
              )}
            >
              <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                {slide.title}
              </h3>
              <p className="text-sm text-white/70 sm:text-base">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <PureCssDots activeIndex={activeIndex} scrollTo={scrollTo} />
    </div>
  );
}
