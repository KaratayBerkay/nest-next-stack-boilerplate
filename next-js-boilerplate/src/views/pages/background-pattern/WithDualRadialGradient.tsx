"use client";

import { cn } from "@/lib/cn";

export function WithDualRadialGradient({ className }: { className?: string }) {
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
            "radial-gradient(ellipse 43% 42% at 0% 12%, color-mix(in srgb, var(--fg) 13%, transparent) 0%, transparent 100%), radial-gradient(ellipse 43% 42% at 100% 12%, color-mix(in srgb, var(--fg) 13%, transparent) 0%, transparent 100%)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
