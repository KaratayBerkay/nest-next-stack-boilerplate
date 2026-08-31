"use client";

import { IconGradienter } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

export function MeshDriftHeroShader() {
  const t = useMessages("pages") as unknown as PagesWithShaderMessages;
  const s = t.shader;

  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-28">
      <style>{`
        @keyframes shader1DriftA {
          0% { transform: translate(-10%, -6%) scale(1); }
          50% { transform: translate(9%, 10%) scale(1.15); }
          100% { transform: translate(-10%, -6%) scale(1); }
        }
        @keyframes shader1DriftB {
          0% { transform: translate(6%, -8%) scale(1.1); }
          50% { transform: translate(-9%, 7%) scale(0.9); }
          100% { transform: translate(6%, -8%) scale(1.1); }
        }
        @keyframes shader1DriftC {
          0% { transform: translate(0%, 9%) scale(0.95); }
          50% { transform: translate(-7%, -10%) scale(1.1); }
          100% { transform: translate(0%, 9%) scale(0.95); }
        }
        .shader1-blob-a { animation: shader1DriftA 22s ease-in-out infinite; }
        .shader1-blob-b { animation: shader1DriftB 26s ease-in-out infinite; }
        .shader1-blob-c { animation: shader1DriftC 30s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shader1-blob-a,
          .shader1-blob-b,
          .shader1-blob-c {
            animation: none;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span
          className="shader1-blob-a absolute top-[-10%] left-[8%] size-[26rem] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--brand) 55%, transparent), transparent 70%)",
          }}
        />
        <span
          className="shader1-blob-b absolute top-[18%] right-[4%] size-[24rem] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--info) 55%, transparent), transparent 70%)",
          }}
        />
        <span
          className="shader1-blob-c absolute bottom-[-16%] left-[28%] size-[28rem] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--success) 50%, transparent), transparent 70%)",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <Badge variant="soft" size="sm" className="gap-1.5">
          <IconGradienter size={14} aria-hidden="true" />
          {s.shader1BadgeLabel}
        </Badge>
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          {s.shader1Eyebrow}
        </span>
        <h2 className="text-fg text-4xl font-semibold tracking-tight lg:text-5xl">
          {s.shader1Heading}
        </h2>
        <p className="text-muted max-w-xl leading-relaxed">{s.shader1Body}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary">{s.shader1PrimaryCta}</Button>
          <Button variant="outline">{s.shader1SecondaryCta}</Button>
        </div>
      </div>
    </section>
  );
}
