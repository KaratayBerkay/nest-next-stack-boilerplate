"use client";

import { cn } from "@/lib/cn";

export function WithDashedGrid({ className }: { className?: string }) {
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
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
