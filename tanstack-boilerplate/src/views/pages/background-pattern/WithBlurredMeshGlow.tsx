"use client";

import { cn } from "@/lib/cn";

const NOISE_URI = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export function WithBlurredMeshGlow({ className }: { className?: string }) {
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
            "radial-gradient(circle 35% at 15% 15%, color-mix(in srgb, var(--brand) 30%, transparent), transparent 70%), radial-gradient(circle 35% at 85% 15%, color-mix(in srgb, var(--info) 30%, transparent), transparent 70%), radial-gradient(ellipse 40% 40% at 50% 50%, color-mix(in srgb, var(--info) 25%, transparent), transparent 70%), radial-gradient(circle 35% at 15% 85%, color-mix(in srgb, var(--success) 30%, transparent), transparent 70%), radial-gradient(circle 35% at 85% 85%, color-mix(in srgb, var(--warning) 30%, transparent), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE_URI,
          opacity: 0.55,
          mixBlendMode: "overlay",
        }}
      />
      <div className="border-border bg-surface-hover/50 relative z-10 aspect-[16/9] w-full max-w-3xl rounded-2xl border border-dashed" />
    </section>
  );
}
