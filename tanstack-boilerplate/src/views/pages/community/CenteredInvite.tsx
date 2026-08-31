"use client";

import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandX,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCommunityMessages } from "@/types/pages/community/CommunityMessages-types";

const LINK_URL = "#" as const;

const SOCIALS = [
  { icon: IconBrandX, labelKey: "community1XLabel" },
  { icon: IconBrandGithub, labelKey: "community1GithubLabel" },
  { icon: IconBrandDiscord, labelKey: "community1DiscordLabel" },
] as const;

export function CenteredInvite() {
  const m = useMessages("pages") as unknown as PagesWithCommunityMessages;
  const co = m.community;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-brand text-brand-fg grid size-14 place-items-center rounded-2xl text-xl font-semibold">
            {co.community1LogoText}
          </div>
          <h2 className="max-w-2xl text-center text-4xl font-semibold tracking-tight lg:text-5xl">
            {co.community1Title}
            <span className="text-muted mt-2 block">
              {co.community1TitleMuted}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {SOCIALS.map((social) => (
            <a
              key={social.labelKey}
              href={LINK_URL}
              aria-label={co[social.labelKey]}
              title={co[social.labelKey]}
              className="border-border text-fg hover:bg-surface-hover focus-visible:ring-brand inline-flex size-12 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <social.icon size={24} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
