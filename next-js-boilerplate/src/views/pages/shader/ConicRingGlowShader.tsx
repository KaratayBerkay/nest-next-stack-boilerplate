"use client";

import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

export function ConicRingGlowShader() {
  const t = useMessages("pages") as unknown as PagesWithShaderMessages;
  const s = t.shader;

  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-28">
      <style>{`
        @keyframes shader4Spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .shader4-ring { animation: shader4Spin 18s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shader4-ring {
            animation: none;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="shader4-ring size-[30rem] rounded-full blur-[2px] lg:size-[36rem]"
          style={{
            background:
              "conic-gradient(from 0deg, color-mix(in srgb, var(--brand) 70%, transparent), color-mix(in srgb, var(--info) 70%, transparent), color-mix(in srgb, var(--success) 70%, transparent), color-mix(in srgb, var(--brand) 70%, transparent))",
            maskImage:
              "radial-gradient(closest-side, transparent 60%, black 62%, black 78%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(closest-side, transparent 60%, black 62%, black 78%, transparent 80%)",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center gap-5 px-6 text-center lg:px-8">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-success size-2 animate-pulse rounded-full"
          />
          <span className="text-muted text-xs font-medium">
            {s.shader4Eyebrow}
          </span>
        </span>
        <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
          {s.shader4Heading}
        </h2>
        <p className="text-muted leading-relaxed">{s.shader4Body}</p>
        <Button variant="primary">{s.shader4Cta}</Button>
        <p className="text-muted text-xs">{s.shader4Note}</p>
      </div>
    </section>
  );
}
