"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const BADGE_KEYS = [
  "feature110Badge1",
  "feature110Badge2",
  "feature110Badge3",
  "feature110Badge4",
] as const;
const AVATAR_SRCS = [
  "/img/placeholders/ph-1x1-0.webp",
  "/img/placeholders/ph-1x1-2.webp",
  "/img/placeholders/ph-1x1-4.webp",
  "/img/placeholders/ph-1x1-6.webp",
];

export function BentoBadgesAvatarCarouselFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-6">
            <h3 className="text-fg text-base font-semibold">
              {f.feature110BadgesTitle}
            </h3>
            <div className="flex flex-wrap gap-2">
              {BADGE_KEYS.map((key) => (
                <Badge key={key}>{f[key]}</Badge>
              ))}
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-6">
            <h3 className="text-fg text-base font-semibold">
              {f.feature110AvatarsTitle}
            </h3>
            <div className="flex -space-x-3">
              {AVATAR_SRCS.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  width={40}
                  height={40}
                  style={{ zIndex: AVATAR_SRCS.length - index }}
                  className="border-bg relative size-10 rounded-full border-2 object-cover"
                />
              ))}
              <span className="bg-surface-hover text-muted border-bg relative flex size-10 items-center justify-center rounded-full border-2 text-xs font-medium">
                {f.feature110AvatarsMore}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
