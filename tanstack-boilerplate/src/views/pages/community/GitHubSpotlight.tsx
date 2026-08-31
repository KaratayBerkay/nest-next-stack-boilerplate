"use client";

import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandGithubFilled,
  IconBrandLinkedin,
  IconBrandX,
  IconGitFork,
  IconStarFilled,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCommunityMessages } from "@/types/pages/community/CommunityMessages-types";

const LINK_URL = "#" as const;

interface StatChip {
  value: string;
  labelKey: string;
  icon: Icon;
  iconClassName: string;
}

interface SocialTile {
  icon: Icon;
  captionKey: string;
}

const STATS: StatChip[] = [
  {
    value: "366",
    labelKey: "community5StarsLabel",
    icon: IconStarFilled,
    iconClassName: "text-warning",
  },
  {
    value: "41",
    labelKey: "community5ForksLabel",
    icon: IconGitFork,
    iconClassName: "text-muted",
  },
  {
    value: "24",
    labelKey: "community5ContributorsLabel",
    icon: IconUsers,
    iconClassName: "text-muted",
  },
];

const SOCIAL_TILES: SocialTile[] = [
  { icon: IconBrandDiscord, captionKey: "community5DiscordCaption" },
  { icon: IconBrandX, captionKey: "community5XCaption" },
  { icon: IconBrandLinkedin, captionKey: "community5LinkedInCaption" },
];

export function GitHubSpotlight() {
  const m = useMessages("pages") as unknown as PagesWithCommunityMessages;
  const co = m.community;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="soft" pill size="sm">
            <IconBrandGithub size={14} aria-hidden="true" className="mr-1.5" />
            GitHub
          </Badge>
          <Typography variant="h2" className="text-4xl lg:text-5xl">
            {co.community5Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.community5Intro}
          </Typography>
        </div>
        <div className="border-border bg-surface relative overflow-hidden rounded-3xl border">
          <div className="relative z-10 flex flex-col gap-6 p-6 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <IconBrandGithubFilled
                  size={24}
                  aria-hidden="true"
                  className="text-muted"
                />
                <span className="font-semibold">shadcnblocks</span>
              </div>
              <a
                href={LINK_URL}
                className="text-muted decoration-border text-sm underline underline-offset-4"
              >
                github.com/shadcnblocks/shadcn-ui-blocks
              </a>
            </div>
            <p className="text-muted max-w-2xl leading-relaxed">
              {co.community5Description}
            </p>
            <div className="flex flex-wrap gap-3">
              {STATS.map((stat) => (
                <div
                  key={stat.labelKey}
                  className="border-border bg-bg flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <stat.icon
                    size={16}
                    aria-hidden="true"
                    className={stat.iconClassName}
                  />
                  <span className="text-sm font-semibold">{stat.value}</span>
                  <span className="text-muted text-sm">
                    {co[stat.labelKey]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <svg
            aria-hidden="true"
            className="text-muted pointer-events-none absolute -right-6 -bottom-6 opacity-40"
            width="240"
            height="240"
          >
            <defs>
              <pattern
                id="github-grid-pattern"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="240" height="240" fill="url(#github-grid-pattern)" />
          </svg>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SOCIAL_TILES.map((tile) => (
            <a
              key={tile.captionKey}
              href={LINK_URL}
              className="border-border bg-surface hover:bg-surface-hover flex items-center justify-center gap-2.5 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-xs"
            >
              <tile.icon size={16} aria-hidden="true" className="text-muted" />
              <span className="text-sm font-medium">{co[tile.captionKey]}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
