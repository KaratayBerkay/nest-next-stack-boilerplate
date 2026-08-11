"use client";

import { cn } from "@/lib/cn";

const GRID_LINE = "color-mix(in srgb, var(--fg) 8%, transparent)";
const CORNER_SOFTEN_MASK =
  "radial-gradient(ellipse 115% 105% at 50% 50%, black 55%, transparent 95%)";

export function WithCssGrid({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "border-border bg-surface relative flex h-[600px] w-full items-center justify-center overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: CORNER_SOFTEN_MASK,
          WebkitMaskImage: CORNER_SOFTEN_MASK,
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
