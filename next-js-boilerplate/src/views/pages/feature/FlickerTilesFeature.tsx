"use client";

import { IconArrowRight, IconCheck, IconSparkles } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TILE_FILLS = [
  "bg-brand/10",
  "bg-success/10",
  "bg-brand/10",
  "bg-brand/10",
  "bg-success/10",
  "bg-brand/10",
  "bg-brand/10",
  "bg-brand/10",
  "bg-success/10",
  "bg-brand/10",
  "bg-success/10",
  "bg-brand/10",
] as const;

const TILE_DELAYS = [
  "0s",
  "0.18s",
  "0.36s",
  "0.54s",
  "0.72s",
  "0.9s",
  "1.08s",
  "1.26s",
  "1.44s",
  "1.62s",
  "1.8s",
  "1.98s",
] as const;

const CHECK_KEYS = [
  "feature235Check1",
  "feature235Check2",
  "feature235Check3",
] as const;

export function FlickerTilesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <style>{`
        @keyframes feature235Flicker {
          0% { opacity: 0.35; }
          100% { opacity: 1; }
        }
        .feature235-flicker-tile {
          animation: feature235Flicker 2.2s ease-in-out infinite alternate;
        }
      `}</style>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature235Heading}
            </h2>
            <p className="text-muted leading-relaxed">
              {f.feature235Paragraph}
            </p>
            <ul className="flex flex-col gap-2.5">
              {CHECK_KEYS.map((checkKey) => (
                <li key={checkKey} className="flex items-start gap-2.5">
                  <span className="bg-brand/10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={13} aria-hidden="true" />
                  </span>
                  <span className="text-muted text-sm">{f[checkKey]}</span>
                </li>
              ))}
            </ul>
            <span className="text-fg inline-flex items-center gap-1.5 text-sm font-medium">
              {f.feature235LinkLabel}
              <IconArrowRight size={16} aria-hidden="true" />
            </span>
          </div>
          <div className="relative">
            <div className="border-border bg-surface rounded-xl border p-3 shadow-lg">
              <div className="bg-bg grid grid-cols-4 gap-3 rounded-lg p-3">
                {TILE_FILLS.map((fill, index) => (
                  <span
                    key={index}
                    className={`feature235-flicker-tile ${fill} h-14 rounded-lg sm:h-16`}
                    style={{ animationDelay: TILE_DELAYS[index] }}
                  />
                ))}
              </div>
            </div>
            <span className="border-border bg-surface text-fg absolute -top-3 -right-3 flex size-9 items-center justify-center rounded-full border shadow-sm">
              <IconSparkles size={16} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
