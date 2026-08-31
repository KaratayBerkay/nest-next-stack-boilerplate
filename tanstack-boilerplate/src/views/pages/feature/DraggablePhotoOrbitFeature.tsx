"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const ORBIT_CSS = `
.orbit-ring {
  animation: orbit-rotate 60s linear infinite;
  --orbit-radius: 10rem;
}
@media (min-width: 1024px) {
  .orbit-ring {
    --orbit-radius: 14rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .orbit-ring,
  .orbit-avatar {
    animation: none;
  }
}
@keyframes orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes orbit-counter {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}
.orbit-avatar {
  animation: orbit-counter 60s linear infinite;
}
`;

const AVATARS = [
  {
    src: "/img/placeholders/ph-1x1-1.webp",
    altKey: "feature283Avatar1Alt",
    angle: 0,
  },
  {
    src: "/img/placeholders/ph-1x1-2.webp",
    altKey: "feature283Avatar2Alt",
    angle: 60,
  },
  {
    src: "/img/placeholders/ph-1x1-0.webp",
    altKey: "feature283Avatar3Alt",
    angle: 120,
  },
  {
    src: "/img/placeholders/ph-1x1-4.webp",
    altKey: "feature283Avatar4Alt",
    angle: 180,
  },
  {
    src: "/img/placeholders/ph-1x1-4.webp",
    altKey: "feature283Avatar5Alt",
    angle: 240,
  },
  {
    src: "/img/placeholders/ph-1x1-6.webp",
    altKey: "feature283Avatar6Alt",
    angle: 300,
  },
] as const;

export function DraggablePhotoOrbitFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <style>{ORBIT_CSS}</style>
        <div className="relative mx-auto max-w-4xl">
          <div className="relative flex flex-col items-center gap-5 py-32 text-center lg:py-40">
            <span className="border-border text-fg inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
              {f.feature283Eyebrow}
            </span>
            <h2 className="text-fg max-w-xl text-3xl font-semibold tracking-tight lg:text-5xl">
              {f.feature283Heading}
            </h2>
            <p className="text-muted max-w-lg leading-relaxed">
              {f.feature283Intro}
            </p>
            <Button size="lg" className="mt-2">
              {f.feature283Button}
            </Button>
          </div>
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="orbit-ring border-border size-80 rounded-full border border-dashed lg:size-[28rem]">
              {AVATARS.map((avatar) => (
                <div
                  key={avatar.altKey}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translateX(var(--orbit-radius)) rotate(-${avatar.angle}deg)`,
                  }}
                >
                  <Image
                    src={avatar.src}
                    alt={f[avatar.altKey]}
                    width={48}
                    height={48}
                    className="orbit-avatar border-bg size-12 rounded-full border-2 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
