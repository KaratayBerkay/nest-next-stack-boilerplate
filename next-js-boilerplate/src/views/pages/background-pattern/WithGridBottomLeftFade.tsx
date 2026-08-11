"use client";

import { cn } from "@/lib/cn";

const GRID_LINE = "color-mix(in srgb, var(--fg) 8%, transparent)";
const BOTTOM_LEFT_MASK =
  "radial-gradient(ellipse 95% 85% at 15% 100%, transparent 0%, black 60%)";

export function WithGridBottomLeftFade({ className }: { className?: string }) {
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
          maskImage: BOTTOM_LEFT_MASK,
          WebkitMaskImage: BOTTOM_LEFT_MASK,
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
