"use client";

import { cn } from "@/lib/cn";

export function WithTopRadialGlow({ className }: { className?: string }) {
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
            "radial-gradient(ellipse 34% 45% at 50% 9%, color-mix(in srgb, var(--fg) 17%, transparent) 0%, color-mix(in srgb, var(--fg) 15%, transparent) 25%, color-mix(in srgb, var(--fg) 10%, transparent) 55%, transparent 100%)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
