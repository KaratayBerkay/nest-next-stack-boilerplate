"use client";

import { cn } from "@/lib/cn";

export function WithDotGridRightFade({ className }: { className?: string }) {
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
            "radial-gradient(color-mix(in srgb, var(--fg) 10%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 45% 48% at 20% 14%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 45% 48% at 20% 14%, black, transparent)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
