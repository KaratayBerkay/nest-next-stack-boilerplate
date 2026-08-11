"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconCheck,
  IconEye,
  IconInfoCircle,
  IconTarget,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface AboutTabDescriptor {
  icon: typeof IconInfoCircle;
  titleKey: "a17Tab1Title" | "a17Tab2Title" | "a17Tab3Title";
  bodyKey: "a17Tab1Body" | "a17Tab2Body" | "a17Tab3Body";
}

const TABS: AboutTabDescriptor[] = [
  { icon: IconInfoCircle, titleKey: "a17Tab1Title", bodyKey: "a17Tab1Body" },
  { icon: IconTarget, titleKey: "a17Tab2Title", bodyKey: "a17Tab2Body" },
  { icon: IconEye, titleKey: "a17Tab3Title", bodyKey: "a17Tab3Body" },
];

const MISSION_STATS = [
  { value: "120", labelKey: "a17Tab2Stat1Label" },
  { value: "12", labelKey: "a17Tab2Stat2Label" },
] as const;

const VISION_BULLETS = [
  { titleKey: "a17Tab3Bullet1Title", bodyKey: "a17Tab3Bullet1Body" },
  { titleKey: "a17Tab3Bullet2Title", bodyKey: "a17Tab3Bullet2Body" },
  { titleKey: "a17Tab3Bullet3Title", bodyKey: "a17Tab3Bullet3Body" },
] as const;

function handleTabSelect(
  index: number,
  setActive: Dispatch<SetStateAction<number>>,
) {
  setActive(index);
}

export function WithInteractive() {
  const t = useMessages("pages").about;
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[320px_1fr] lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-3">
          {TABS.map((item, index) => {
            const ItemIcon = item.icon;
            const isActive = index === active;
            return (
              <button
                key={item.titleKey}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleTabSelect(index, setActive)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl p-5 text-left transition-colors",
                  isActive ? "bg-muted" : "text-muted",
                )}
              >
                <ItemIcon
                  size={24}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-brand" : "",
                  )}
                />
                <Typography
                  variant="h3"
                  className="text-lg font-medium tracking-tight"
                >
                  {t[item.titleKey]}
                </Typography>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-6">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {t[tab.titleKey]}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t[tab.bodyKey]}
          </Typography>

          {active === 0 && (
            <AspectRatio
              ratio={16 / 9}
              className="bg-surface relative rounded-2xl"
            >
              <Image
                src="https://picsum.photos/seed/about17-1/1600/900"
                alt={t.a17Tab1ImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </AspectRatio>
          )}

          {active === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {MISSION_STATS.map((stat) => (
                <div
                  key={stat.labelKey}
                  className="bg-muted flex flex-col gap-1 rounded-2xl p-6"
                >
                  <Typography
                    variant="h3"
                    className="text-3xl font-medium tracking-tighter"
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body" className="text-muted">
                    {t[stat.labelKey]}
                  </Typography>
                </div>
              ))}
            </div>
          )}

          {active === 2 && (
            <div className="flex flex-col gap-5">
              {VISION_BULLETS.map((bullet) => (
                <div key={bullet.titleKey} className="flex items-start gap-4">
                  <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <IconCheck size={20} className="text-brand" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Typography
                      variant="h3"
                      className="text-lg font-medium tracking-tight"
                    >
                      {t[bullet.titleKey]}
                    </Typography>
                    <Typography variant="body" className="text-muted">
                      {t[bullet.bodyKey]}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
