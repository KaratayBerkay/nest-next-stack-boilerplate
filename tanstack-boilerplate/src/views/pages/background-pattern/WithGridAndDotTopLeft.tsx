"use client";

import { cn } from "@/lib/cn";

export function WithGridAndDotTopLeft({ className }: { className?: string }) {
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
            "linear-gradient(color-mix(in srgb, var(--fg) 3%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--fg) 3%, transparent) 1px, transparent 1px), radial-gradient(color-mix(in srgb, var(--fg) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "27px 27px, 27px 27px, 9px 9px",
          maskImage:
            "radial-gradient(ellipse 60% 42% at 15% 15%, black 25%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 42% at 15% 15%, black 25%, transparent 85%)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
