"use client";

import { useState } from "react";
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

export function AmbientVideoBackdropHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-28">
      <style>{`
        @keyframes hero3Drift {
          0% { background-position: 0% 30%, 100% 70%, 50% 50%; }
          50% { background-position: 100% 60%, 0% 40%, 60% 60%; }
          100% { background-position: 0% 30%, 100% 70%, 50% 50%; }
        }
        .hero3-backdrop { animation: hero3Drift 22s ease-in-out infinite; }
        .hero3-backdrop.hero3-paused { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .hero3-backdrop { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={
            isPlaying
              ? "hero3-backdrop absolute inset-0"
              : "hero3-backdrop hero3-paused absolute inset-0"
          }
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--brand) 55%, transparent), transparent 55%), radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--info) 50%, transparent), transparent 55%), radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--fg) 85%, transparent), var(--fg) 100%)",
            backgroundSize: "180% 180%, 180% 180%, 100% 100%",
            filter: "blur(4px) saturate(1.1)",
          }}
        />
        <div className="bg-fg/40 absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <span className="bg-bg/15 text-bg inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase backdrop-blur-sm">
          {h.hero3Eyebrow}
        </span>
        <h1 className="text-bg text-4xl font-semibold tracking-tight lg:text-6xl">
          {h.hero3Heading}
        </h1>
        <p className="text-bg/80 max-w-xl text-lg">{h.hero3Subheading}</p>
        <Button variant="shadow" size="lg" className="mt-2">
          {h.hero3PrimaryCta}
        </Button>

        <div className="bg-bg/10 mt-6 flex items-center gap-3 rounded-full p-2 backdrop-blur-sm">
          <IconButton
            icon={
              isPlaying ? (
                <IconPlayerPause size={16} className="text-bg" />
              ) : (
                <IconPlayerPlay size={16} className="text-bg" />
              )
            }
            label={isPlaying ? h.hero3PauseAria : h.hero3PlayAria}
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsPlaying((prev) => !prev)}
          />
          <span className="bg-bg/30 h-4 w-px" aria-hidden="true" />
          <IconButton
            icon={
              isMuted ? (
                <IconVolumeOff size={16} className="text-bg" />
              ) : (
                <IconVolume size={16} className="text-bg" />
              )
            }
            label={isMuted ? h.hero3UnmuteAria : h.hero3MuteAria}
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsMuted((prev) => !prev)}
          />
          <span className="text-bg/80 pr-2 text-xs tabular-nums">
            {isPlaying ? h.hero3NowPlaying : h.hero3Duration}
          </span>
        </div>
      </div>
    </section>
  );
}
