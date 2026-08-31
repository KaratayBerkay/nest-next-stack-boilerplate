"use client";

import { cn } from "@/lib/cn";

export function WithCircuitBoardTopFade({ className }: { className?: string }) {
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
          backgroundImage:
            "radial-gradient(circle at 6px 6px, color-mix(in srgb, var(--fg) 10%, transparent) 1.5px, transparent 2.5px), linear-gradient(-45deg, transparent 28px, color-mix(in srgb, var(--fg) 10%, transparent) 28px 29px, transparent 29px), linear-gradient(45deg, transparent 17px, color-mix(in srgb, var(--fg) 10%, transparent) 17px 18px, transparent 18px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom, #000 0%, transparent 55%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, transparent 55%)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
