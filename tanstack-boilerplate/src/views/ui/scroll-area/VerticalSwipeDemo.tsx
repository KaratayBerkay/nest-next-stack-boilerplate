"use client";

import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { cn } from "@/lib/cn";

const SECTIONS = [
  {
    color: "from-sky-500 to-cyan-400",
    title: "Section A",
    body: "Drag this pane vertically to scroll. No visible scrollbar — the drag-pan gesture drives scrolling.",
  },
  {
    color: "from-violet-500 to-purple-600",
    title: "Section B",
    body: "Each section is roughly viewport-height. The scroll-fade-y mask softens the top and bottom edges.",
  },
  {
    color: "from-rose-500 to-pink-500",
    title: "Section C",
    body: "Built with the same useYSwipeGesture pattern used across the app.",
  },
];

export function VerticalSwipeDemo() {
  const yPanRef = useYSwipeGesture<HTMLDivElement>();

  return (
    <div
      ref={yPanRef}
      role="region"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- axe scrollable-region-focusable: keyboard users must be able to scroll this pane
      tabIndex={0}
      aria-label="Scrollable sections"
      className="scroll-fade-y border-border relative h-80 overflow-y-auto rounded-lg border"
    >
      <div className="flex flex-col">
        {SECTIONS.map((s, i) => (
          <section
            key={i}
            className={cn(
              "flex min-h-[80vh] flex-col items-center justify-center gap-4 bg-gradient-to-br p-8 text-center text-white",
              s.color,
            )}
          >
            <h3 className="text-2xl font-bold">{s.title}</h3>
            <p className="max-w-md text-sm text-white/80">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
