"use client";

import { cn } from "@/lib/cn";

export function WithCenterSpotlight({ className }: { className?: string }) {
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
            "radial-gradient(ellipse 48% 64% at 50% 50%, color-mix(in srgb, var(--fg) 11%, transparent) 0%, color-mix(in srgb, var(--fg) 8%, transparent) 30%, color-mix(in srgb, var(--fg) 3.5%, transparent) 65%, transparent 100%)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
