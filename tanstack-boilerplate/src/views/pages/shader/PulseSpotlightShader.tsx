"use client";

import { IconSun } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

export function PulseSpotlightShader() {
  const t = useMessages("pages") as unknown as PagesWithShaderMessages;
  const s = t.shader;

  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-28">
      <style>{`
        @keyframes shader5Pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.45; }
          50% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.8; }
        }
        .shader5-glow { animation: shader5Pulse 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shader5-glow {
            animation: none;
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span
          className="shader5-glow absolute top-1/2 left-1/2 size-[32rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--brand) 55%, transparent), transparent 70%)",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <span className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <IconSun size={14} aria-hidden="true" />
          {s.shader5Eyebrow}
        </span>
        <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
          {s.shader5Heading}
        </h2>
        <p className="text-muted max-w-xl leading-relaxed">{s.shader5Body}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary">{s.shader5PrimaryCta}</Button>
          <Button variant="link">{s.shader5SecondaryCta}</Button>
        </div>
      </div>
    </section>
  );
}
