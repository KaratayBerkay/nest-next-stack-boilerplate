"use client";

import type { ReactNode } from "react";
import {
  IconBolt,
  IconLock,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

interface TrustBadge {
  id: string;
  labelKey: string;
  icon: ReactNode;
}

const BADGES: TrustBadge[] = [
  {
    id: "compliance",
    labelKey: "hero7Badge1Label",
    icon: <IconShieldCheck size={16} aria-hidden="true" />,
  },
  {
    id: "privacy",
    labelKey: "hero7Badge2Label",
    icon: <IconLock size={16} aria-hidden="true" />,
  },
  {
    id: "uptime",
    labelKey: "hero7Badge3Label",
    icon: <IconBolt size={16} aria-hidden="true" />,
  },
  {
    id: "support",
    labelKey: "hero7Badge4Label",
    icon: <IconUsers size={16} aria-hidden="true" />,
  },
];

export function TrustBadgeRowHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <span className="text-brand text-xs font-medium tracking-widest uppercase">
          {h.hero7Eyebrow}
        </span>
        <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-6xl">
          {h.hero7Heading}
        </h1>
        <p className="text-muted max-w-2xl text-lg">{h.hero7Subheading}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="lg">
            {h.hero7PrimaryCta}
          </Button>
          <Button variant="outline" size="lg">
            {h.hero7SecondaryCta}
          </Button>
        </div>
        <span className="text-muted text-xs">{h.hero7CtaNote}</span>

        <div className="border-border mt-8 flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 border-t pt-8">
          {BADGES.map((badge) => (
            <span
              key={badge.id}
              className="border-border text-muted inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
            >
              {badge.icon}
              {h[badge.labelKey]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
