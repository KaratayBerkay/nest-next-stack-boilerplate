"use client";

import {
  IconBrandDribbble,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithTeamMessages } from "@/types/pages/team/TeamMessages-types";

interface SocialLink {
  icon: Icon;
  platformKey: string;
  href: string;
}

interface Member {
  id: string;
  initials: string;
  avatarVariant: AvatarVariant;
  nameKey: string;
  roleKey: string;
  bioKey: string;
  socials: SocialLink[];
}

const LINK_URL = "https://example.com" as const;

const MEMBERS: Member[] = [
  {
    id: "t1-1",
    initials: "MC",
    avatarVariant: "brand",
    nameKey: "team1Member1Name",
    roleKey: "team1Member1Role",
    bioKey: "team1Member1Bio",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team1PlatformLinkedin",
        href: LINK_URL,
      },
      {
        icon: IconBrandGithub,
        platformKey: "team1PlatformGithub",
        href: LINK_URL,
      },
    ],
  },
  {
    id: "t1-2",
    initials: "JF",
    avatarVariant: "success",
    nameKey: "team1Member2Name",
    roleKey: "team1Member2Role",
    bioKey: "team1Member2Bio",
    socials: [
      {
        icon: IconBrandGithub,
        platformKey: "team1PlatformGithub",
        href: LINK_URL,
      },
      { icon: IconBrandX, platformKey: "team1PlatformX", href: LINK_URL },
    ],
  },
  {
    id: "t1-3",
    initials: "PN",
    avatarVariant: "info",
    nameKey: "team1Member3Name",
    roleKey: "team1Member3Role",
    bioKey: "team1Member3Bio",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team1PlatformLinkedin",
        href: LINK_URL,
      },
      {
        icon: IconBrandDribbble,
        platformKey: "team1PlatformDribbble",
        href: LINK_URL,
      },
    ],
  },
  {
    id: "t1-4",
    initials: "TI",
    avatarVariant: "warning",
    nameKey: "team1Member4Name",
    roleKey: "team1Member4Role",
    bioKey: "team1Member4Bio",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team1PlatformLinkedin",
        href: LINK_URL,
      },
      { icon: IconBrandX, platformKey: "team1PlatformX", href: LINK_URL },
    ],
  },
  {
    id: "t1-5",
    initials: "SO",
    avatarVariant: "default",
    nameKey: "team1Member5Name",
    roleKey: "team1Member5Role",
    bioKey: "team1Member5Bio",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team1PlatformLinkedin",
        href: LINK_URL,
      },
      { icon: IconMail, platformKey: "team1PlatformMail", href: LINK_URL },
    ],
  },
  {
    id: "t1-6",
    initials: "LM",
    avatarVariant: "brand",
    nameKey: "team1Member6Name",
    roleKey: "team1Member6Role",
    bioKey: "team1Member6Bio",
    socials: [
      {
        icon: IconBrandGithub,
        platformKey: "team1PlatformGithub",
        href: LINK_URL,
      },
      {
        icon: IconBrandLinkedin,
        platformKey: "team1PlatformLinkedin",
        href: LINK_URL,
      },
    ],
  },
];

export function HoverRevealPortraitGridTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team1Intro}</p>
        </div>

        <ul
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={tm.team1GridAria}
        >
          {MEMBERS.map((member) => (
            <li key={member.id} className="group relative">
              <div className="border-border bg-surface relative flex aspect-[4/5] flex-col items-center justify-center overflow-hidden rounded-2xl border">
                <Avatar
                  fallback={member.initials}
                  size="xl"
                  variant={member.avatarVariant}
                  className="mb-4"
                />
                <p className="text-fg text-base font-semibold">
                  {tm[member.nameKey]}
                </p>
                <p className="text-muted text-sm">{tm[member.roleKey]}</p>

                <div className="border-border bg-bg/95 absolute inset-x-0 bottom-0 flex translate-y-full flex-col gap-3 border-t p-5 transition-transform duration-300 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0">
                  <p className="text-muted text-sm leading-relaxed">
                    {tm[member.bioKey]}
                  </p>
                  <div className="flex items-center gap-3">
                    {member.socials.map((social) => (
                      <a
                        key={social.platformKey}
                        href={social.href}
                        className="text-muted hover:text-fg focus-visible:ring-brand rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        aria-label={tm.team1SocialLinkAriaTemplate
                          .replace("{name}", tm[member.nameKey])
                          .replace("{platform}", tm[social.platformKey])}
                      >
                        <social.icon size={18} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
