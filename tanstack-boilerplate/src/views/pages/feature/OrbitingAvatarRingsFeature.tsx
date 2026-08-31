"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

interface OrbitAvatar {
  id: string;
  src: string;
  altKey: string;
  angleDeg: number;
  radiusPct: number;
  size: number;
}

const ORBIT_AVATARS: OrbitAvatar[] = [
  { id: "a1", src: "/img/placeholders/ph-1x1-0.webp", altKey: "feature254Avatar1Alt", angleDeg: 0, radiusPct: 42, size: 56 },
  { id: "a2", src: "/img/placeholders/ph-1x1-2.webp", altKey: "feature254Avatar2Alt", angleDeg: 60, radiusPct: 42, size: 44 },
  { id: "a3", src: "/img/placeholders/ph-1x1-4.webp", altKey: "feature254Avatar3Alt", angleDeg: 120, radiusPct: 42, size: 52 },
  { id: "a4", src: "/img/placeholders/ph-1x1-5.webp", altKey: "feature254Avatar4Alt", angleDeg: 180, radiusPct: 42, size: 44 },
  { id: "a5", src: "/img/placeholders/ph-1x1-6.webp", altKey: "feature254Avatar5Alt", angleDeg: 240, radiusPct: 42, size: 56 },
  { id: "a6", src: "/img/placeholders/ph-1x1-7.webp", altKey: "feature254Avatar6Alt", angleDeg: 300, radiusPct: 42, size: 44 },
];

function orbitStyle(avatar: OrbitAvatar) {
  const radians = (avatar.angleDeg * Math.PI) / 180;
  const x = 50 + avatar.radiusPct * Math.cos(radians);
  const y = 50 + avatar.radiusPct * Math.sin(radians);
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: avatar.size,
    height: avatar.size,
  };
}

export function OrbitingAvatarRingsFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="relative mx-auto flex aspect-square max-w-md items-center justify-center">
          <div
            aria-hidden="true"
            className="border-border absolute inset-[8%] rounded-full border border-dashed"
          />
          <div
            aria-hidden="true"
            className="border-border absolute inset-[24%] rounded-full border border-dashed"
          />
          {ORBIT_AVATARS.map((avatar) => (
            <Image
              key={avatar.id}
              src={avatar.src}
              alt={f[avatar.altKey]}
              width={avatar.size}
              height={avatar.size}
              style={orbitStyle(avatar)}
              className="border-bg bg-surface absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 object-cover shadow-sm"
            />
          ))}
          <div className="relative z-10 flex max-w-[60%] flex-col items-center gap-4 text-center">
            <h2 className="text-fg text-2xl font-semibold tracking-tight">
              {f.feature254Heading}
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              {f.feature254Body}
            </p>
            <Button asChild variant="primary" size="sm">
              <Link href="#">{f.feature254Button}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
