"use client";

import { IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

export function AuroraGradientBackdropHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;

  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-28">
      <style>{`
        @keyframes hero4Pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero4-aurora { animation: hero4Pan 20s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero4-aurora {
            animation: none;
            background-position: 40% 50%;
          }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="hero4-aurora absolute -inset-24"
          style={{
            backgroundImage:
              "conic-gradient(from 120deg at 50% 50%, color-mix(in srgb, var(--brand) 45%, transparent), color-mix(in srgb, var(--info) 45%, transparent), color-mix(in srgb, var(--success) 40%, transparent), color-mix(in srgb, var(--brand) 45%, transparent))",
            backgroundSize: "220% 220%",
            filter: "blur(90px)",
            opacity: 0.55,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <span className="border-border bg-bg/70 text-brand inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm">
          <IconSparkles size={13} aria-hidden="true" />
          {h.hero4Eyebrow}
        </span>
        <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-6xl">
          {h.hero4Heading}
        </h1>
        <p className="text-muted max-w-xl text-lg">{h.hero4Subheading}</p>
        <Button variant="primary" size="lg" className="mt-2">
          {h.hero4PrimaryCta}
        </Button>
        <span className="text-muted text-xs">{h.hero4Note}</span>
      </div>
    </section>
  );
}
