"use client";

import { cn } from "@/lib/cn";

const CROSS_GRID =
  "repeating-linear-gradient(45deg, transparent 0 22px, color-mix(in srgb, var(--muted) 55%, transparent) 22px 24px), repeating-linear-gradient(-45deg, transparent 0 22px, color-mix(in srgb, var(--muted) 55%, transparent) 22px 24px)";
const CENTER_MASK =
  "radial-gradient(ellipse 80% 65% at 50% 50%, black 25%, transparent 75%)";

export function WithDiagonalCrossCenter({ className }: { className?: string }) {
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
          backgroundImage: CROSS_GRID,
          maskImage: CENTER_MASK,
          WebkitMaskImage: CENTER_MASK,
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
