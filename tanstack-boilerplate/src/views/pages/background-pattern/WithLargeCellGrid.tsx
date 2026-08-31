"use client";

import { cn } from "@/lib/cn";

const GRID_LINE = "color-mix(in srgb, var(--fg) 8%, transparent)";
const TOP_RIGHT_MASK =
  "radial-gradient(ellipse 65% 55% at 100% 0%, black 0%, transparent 70%)";

export function WithLargeCellGrid({ className }: { className?: string }) {
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
          backgroundSize: "80px 80px",
          maskImage: TOP_RIGHT_MASK,
          WebkitMaskImage: TOP_RIGHT_MASK,
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
