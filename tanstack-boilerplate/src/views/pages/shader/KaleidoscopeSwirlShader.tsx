"use client";

import { IconCheck, IconSpiral } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

const FEATURE_KEYS = [
  "shader7Feature1",
  "shader7Feature2",
  "shader7Feature3",
] as const;

export function KaleidoscopeSwirlShader() {
  const t = useMessages("pages") as unknown as PagesWithShaderMessages;
  const s = t.shader;

  return (
    <section className="w-full py-16 lg:py-24">
      <style>{`
        @keyframes shader7SpinCw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shader7SpinCcw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .shader7-disc-a { animation: shader7SpinCw 26s linear infinite; }
        .shader7-disc-b { animation: shader7SpinCcw 34s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shader7-disc-a,
          .shader7-disc-b {
            animation: none;
          }
        }
      `}</style>
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border bg-surface relative flex min-h-[28rem] items-center justify-center overflow-hidden rounded-2xl border p-8 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span
              className="shader7-disc-a mix-blend-overlay absolute size-[26rem] rounded-full blur-2xl lg:size-[32rem]"
              style={{
                background:
                  "conic-gradient(from 0deg, color-mix(in srgb, var(--brand) 60%, transparent), transparent 30%, color-mix(in srgb, var(--info) 55%, transparent), transparent 70%, color-mix(in srgb, var(--brand) 60%, transparent))",
              }}
            />
            <span
              className="shader7-disc-b mix-blend-overlay absolute size-[22rem] rounded-full blur-2xl lg:size-[28rem]"
              style={{
                background:
                  "conic-gradient(from 90deg, color-mix(in srgb, var(--success) 55%, transparent), transparent 35%, color-mix(in srgb, var(--warning) 50%, transparent), transparent 75%, color-mix(in srgb, var(--success) 55%, transparent))",
              }}
            />
          </div>
          <div className="border-border bg-bg/70 relative z-10 w-full max-w-md rounded-2xl border p-6 text-center shadow-lg backdrop-blur-md lg:p-8">
            <span className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <IconSpiral size={14} aria-hidden="true" />
              {s.shader7Eyebrow}
            </span>
            <h2 className="text-fg mt-3 text-2xl font-semibold tracking-tight lg:text-3xl">
              {s.shader7Heading}
            </h2>
            <p className="text-muted mt-3 text-sm leading-relaxed">
              {s.shader7Body}
            </p>
            <ul className="mt-5 flex flex-col items-start gap-2 text-left">
              {FEATURE_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span className="bg-brand/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={13} aria-hidden="true" />
                  </span>
                  <span className="text-muted text-sm">{s[key]}</span>
                </li>
              ))}
            </ul>
            <Button variant="primary" className="mt-6 w-full">
              {s.shader7Cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
