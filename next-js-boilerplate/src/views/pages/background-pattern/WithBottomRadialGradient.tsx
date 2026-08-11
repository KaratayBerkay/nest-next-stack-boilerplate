"use client";

import { cn } from "@/lib/cn";

export function WithBottomRadialGradient({
  className,
}: {
  className?: string;
}) {
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
            "radial-gradient(125% 125% at 50% 90%, var(--surface) 40%, color-mix(in srgb, var(--brand) 75%, transparent) 100%)",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
