"use client";

import { IconRainbow } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

interface StatEntry {
  id: string;
  valueKey: string;
  labelKey: string;
}

const STATS: StatEntry[] = [
  {
    id: "stat-1",
    valueKey: "shader2Stat1Value",
    labelKey: "shader2Stat1Label",
  },
  {
    id: "stat-2",
    valueKey: "shader2Stat2Value",
    labelKey: "shader2Stat2Label",
  },
  {
    id: "stat-3",
    valueKey: "shader2Stat3Value",
    labelKey: "shader2Stat3Label",
  },
];

export function AuroraBlendBannerShader() {
  const t = useMessages("pages") as unknown as PagesWithShaderMessages;
  const s = t.shader;

  return (
    <section className="w-full py-16 lg:py-24">
      <style>{`
        @keyframes shader2Pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .shader2-aurora { animation: shader2Pan 18s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .shader2-aurora {
            animation: none;
            background-position: 30% 50%;
          }
        }
      `}</style>
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border bg-surface relative overflow-hidden rounded-2xl border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="shader2-aurora absolute -inset-16"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, color-mix(in srgb, var(--brand) 55%, transparent) 0%, color-mix(in srgb, var(--info) 55%, transparent) 22%, color-mix(in srgb, var(--success) 50%, transparent) 45%, color-mix(in srgb, var(--warning) 45%, transparent) 68%, color-mix(in srgb, var(--brand) 55%, transparent) 100%)",
                backgroundSize: "260% 260%",
                filter: "blur(70px)",
                mixBlendMode: "overlay",
                opacity: 0.9,
              }}
            />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-16 text-center lg:px-12 lg:py-20">
            <span className="text-brand inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <IconRainbow size={14} aria-hidden="true" />
              {s.shader2Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {s.shader2Heading}
            </h2>
            <p className="text-muted max-w-xl leading-relaxed">
              {s.shader2Body}
            </p>
            <Button variant="primary">{s.shader2Cta}</Button>
            <div className="border-border mt-4 grid w-full max-w-lg grid-cols-3 gap-4 border-t pt-6">
              {STATS.map((stat) => (
                <div key={stat.id} className="flex flex-col items-center gap-1">
                  <span className="text-fg text-2xl font-semibold tracking-tight">
                    {s[stat.valueKey]}
                  </span>
                  <span className="text-muted text-xs">{s[stat.labelKey]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
