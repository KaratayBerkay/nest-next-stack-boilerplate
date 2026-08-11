"use client";

import { cn } from "@/lib/cn";

export function WithDashedGridTopEdge({ className }: { className?: string }) {
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
            "repeating-linear-gradient(90deg, transparent 0 4px, color-mix(in srgb, var(--muted) 55%, transparent) 4px 8px), repeating-linear-gradient(180deg, transparent 0 4px, color-mix(in srgb, var(--muted) 55%, transparent) 4px 8px)",
          maskImage: "linear-gradient(to bottom, black 30%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 30%, transparent 85%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 45% at 50% 0%, color-mix(in srgb, var(--fg) 5%, transparent), transparent 75%)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
