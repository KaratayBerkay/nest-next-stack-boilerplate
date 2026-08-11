"use client";

import { cn } from "@/lib/cn";

export function WithMultiCornerGlow({ className }: { className?: string }) {
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
            "radial-gradient(ellipse 45% 40% at 0% 0%, color-mix(in srgb, var(--brand) 20%, transparent), transparent 70%), radial-gradient(ellipse 45% 40% at 100% 0%, color-mix(in srgb, var(--info) 20%, transparent), transparent 70%), radial-gradient(ellipse 45% 40% at 0% 100%, color-mix(in srgb, var(--success) 20%, transparent), transparent 70%), radial-gradient(ellipse 45% 40% at 100% 100%, color-mix(in srgb, var(--warning) 20%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 0deg, transparent 0 1deg, color-mix(in srgb, var(--fg) 25%, transparent) 1deg 2deg), repeating-conic-gradient(from 45deg, transparent 0 1deg, color-mix(in srgb, var(--fg) 15%, transparent) 1deg 2deg)",
          backgroundSize: "3px 3px, 4px 4px",
          mixBlendMode: "overlay",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
