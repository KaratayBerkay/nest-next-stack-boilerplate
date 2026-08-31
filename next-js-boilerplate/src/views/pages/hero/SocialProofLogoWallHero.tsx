"use client";

import { IconStarFilled } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

interface Reviewer {
  id: string;
  name: string;
}

const REVIEWERS: Reviewer[] = [
  { id: "reviewer-1", name: "Mia Ramos" },
  { id: "reviewer-2", name: "Devon Klein" },
  { id: "reviewer-3", name: "Priya Shah" },
  { id: "reviewer-4", name: "Tomas Lund" },
];

const COMPANIES = [
  "NORTHPEAK",
  "VELORA",
  "ASTRAL LABS",
  "HARBOR & CO",
  "GRIDLINE",
  "KESTREL",
] as const;

export function SocialProofLogoWallHero() {
  const t = useMessages("pages") as unknown as PagesWithHeroMessages;
  const h = t.hero;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 text-center lg:px-8">
        <span className="text-brand text-xs font-medium tracking-widest uppercase">
          {h.hero6Eyebrow}
        </span>
        <h1 className="text-fg text-4xl font-semibold tracking-tight lg:text-6xl">
          {h.hero6Heading}
        </h1>
        <p className="text-muted max-w-2xl text-lg">{h.hero6Subheading}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="lg">
            {h.hero6PrimaryCta}
          </Button>
          <Button variant="ghost" size="lg">
            {h.hero6SecondaryCta}
          </Button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <AvatarGroup size="sm">
            {REVIEWERS.map((reviewer) => (
              <Avatar
                key={reviewer.id}
                fallback={reviewer.name}
                alt={reviewer.name}
                variant="brand"
                size="sm"
              />
            ))}
          </AvatarGroup>
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="text-warning flex items-center gap-0.5"
            >
              <IconStarFilled size={14} />
              <IconStarFilled size={14} />
              <IconStarFilled size={14} />
              <IconStarFilled size={14} />
              <IconStarFilled size={14} />
            </span>
            <span className="text-fg text-sm font-medium">
              {h.hero6RatingValue}
            </span>
            <span className="text-muted text-sm">{h.hero6RatingCount}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-5xl px-6 lg:px-8">
        <p className="text-muted mb-6 text-center text-xs tracking-widest uppercase">
          {h.hero6LogosLabel}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {COMPANIES.map((company) => (
            <span
              key={company}
              className="text-muted/70 text-lg font-semibold tracking-tight"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
