"use client";

import { IconCheck } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

const BULLET_KEYS = [
  "shader6Bullet1",
  "shader6Bullet2",
  "shader6Bullet3",
] as const;

export function WaveStripeBackdropShader() {
  const t = useMessages("pages") as unknown as PagesWithShaderMessages;
  const s = t.shader;

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      <style>{`
        @keyframes shader6Flow {
          0% { background-position: 0 0; }
          100% { background-position: 140px 140px; }
        }
        .shader6-stripes { animation: shader6Flow 6s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shader6-stripes {
            animation: none;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="shader6-stripes pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, color-mix(in srgb, var(--brand) 12%, transparent) 0px, color-mix(in srgb, var(--brand) 12%, transparent) 2px, transparent 2px, transparent 26px)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {s.shader6Heading}
            </h2>
            <p className="text-muted leading-relaxed">{s.shader6Body}</p>
            <ul className="flex flex-col gap-2.5">
              {BULLET_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span className="bg-brand/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={13} aria-hidden="true" />
                  </span>
                  <span className="text-muted text-sm">{s[key]}</span>
                </li>
              ))}
            </ul>
            <Button variant="primary">{s.shader6Cta}</Button>
          </div>
          <div className="relative">
            <Card variant="elevated" className="mx-auto w-full max-w-sm">
              <div className="flex flex-col items-center gap-2 p-6 text-center @sm:p-8">
                <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                  {s.shader6CardLabel}
                </span>
                <span className="text-fg text-3xl font-semibold tracking-tight">
                  {s.shader6CardValue}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
