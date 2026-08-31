"use client";

import { cn } from "@/lib/cn";

const GRID_LINE = "color-mix(in srgb, var(--fg) 8%, transparent)";
const GRID_LINE_STRONG = "color-mix(in srgb, var(--fg) 14%, transparent)";
const BOTTOM_RIGHT_MASK =
  "radial-gradient(ellipse 95% 85% at 85% 100%, transparent 0%, black 60%)";

export function WithGridBottomRightFade({ className }: { className?: string }) {
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
          backgroundImage: `linear-gradient(to right, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE} 1px, transparent 1px), linear-gradient(to right, ${GRID_LINE_STRONG} 1px, transparent 1px), linear-gradient(to bottom, ${GRID_LINE_STRONG} 1px, transparent 1px)`,
          backgroundSize: "40px 40px, 40px 40px, 160px 160px, 160px 160px",
          maskImage: BOTTOM_RIGHT_MASK,
          WebkitMaskImage: BOTTOM_RIGHT_MASK,
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
