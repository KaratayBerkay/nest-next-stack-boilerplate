"use client";

import { IconAperture } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

const NOISE_URI = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='shader3noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23shader3noise)'/%3E%3C/svg%3E")`;

export function GrainGradientPanelShader() {
  const t = useMessages("pages") as unknown as PagesWithShaderMessages;
  const s = t.shader;

  return (
    <section className="w-full py-16 lg:py-24">
      <style>{`
        @keyframes shader3HueDrift {
          0% { filter: blur(70px) hue-rotate(0deg); }
          50% { filter: blur(70px) hue-rotate(25deg); }
          100% { filter: blur(70px) hue-rotate(0deg); }
        }
        .shader3-gradient { animation: shader3HueDrift 24s ease-in-out infinite; }
        @keyframes shader3GrainPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.55; }
        }
        .shader3-grain { animation: shader3GrainPulse 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shader3-gradient,
          .shader3-grain {
            animation: none;
          }
        }
      `}</style>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface relative flex min-h-[26rem] w-full items-center justify-center overflow-hidden rounded-2xl border p-8 lg:p-12">
          <div
            aria-hidden="true"
            className="shader3-gradient pointer-events-none absolute -inset-10"
            style={{
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, var(--brand) 35%, transparent), transparent 55%, color-mix(in srgb, var(--info) 30%, transparent))",
              filter: "blur(70px)",
            }}
          />
          <div
            aria-hidden="true"
            className="shader3-grain pointer-events-none absolute inset-0"
            style={{
              backgroundImage: NOISE_URI,
              mixBlendMode: "overlay",
            }}
          />
          <Card variant="elevated" className="relative z-10 w-full max-w-md">
            <div className="flex flex-col items-center gap-4 p-6 text-center @sm:p-8">
              <Badge variant="soft" size="sm" className="gap-1.5">
                <IconAperture size={14} aria-hidden="true" />
                {s.shader3Badge}
              </Badge>
              <span className="text-brand text-xs font-semibold tracking-wider uppercase">
                {s.shader3Eyebrow}
              </span>
              <h2 className="text-fg text-2xl font-semibold tracking-tight">
                {s.shader3Heading}
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                {s.shader3Body}
              </p>
              <Button variant="primary">{s.shader3Cta}</Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
