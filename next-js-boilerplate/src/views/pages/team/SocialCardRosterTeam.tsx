"use client";

import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { BadgeVariant } from "@/types/ui/Badge-types";
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
  departmentKey: string;
  departmentVariant: BadgeVariant;
  socials: SocialLink[];
}

const LINK_URL = "https://example.com" as const;

const MEMBERS: Member[] = [
  {
    id: "t2-1",
    initials: "NP",
    avatarVariant: "brand",
    nameKey: "team2Member1Name",
    roleKey: "team2Member1Role",
    bioKey: "team2Member1Bio",
    departmentKey: "team2Member1Department",
    departmentVariant: "info",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team2PlatformLinkedin",
        href: LINK_URL,
      },
      {
        icon: IconBrandGithub,
        platformKey: "team2PlatformGithub",
        href: LINK_URL,
      },
    ],
  },
  {
    id: "t2-2",
    initials: "FB",
    avatarVariant: "info",
    nameKey: "team2Member2Name",
    roleKey: "team2Member2Role",
    bioKey: "team2Member2Bio",
    departmentKey: "team2Member2Department",
    departmentVariant: "secondary",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team2PlatformLinkedin",
        href: LINK_URL,
      },
      { icon: IconBrandX, platformKey: "team2PlatformX", href: LINK_URL },
    ],
  },
  {
    id: "t2-3",
    initials: "IS",
    avatarVariant: "warning",
    nameKey: "team2Member3Name",
    roleKey: "team2Member3Role",
    bioKey: "team2Member3Bio",
    departmentKey: "team2Member3Department",
    departmentVariant: "success",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team2PlatformLinkedin",
        href: LINK_URL,
      },
      {
        icon: IconBrandGithub,
        platformKey: "team2PlatformGithub",
        href: LINK_URL,
      },
    ],
  },
  {
    id: "t2-4",
    initials: "MW",
    avatarVariant: "brand",
    nameKey: "team2Member4Name",
    roleKey: "team2Member4Role",
    bioKey: "team2Member4Bio",
    departmentKey: "team2Member4Department",
    departmentVariant: "info",
    socials: [
      {
        icon: IconBrandGithub,
        platformKey: "team2PlatformGithub",
        href: LINK_URL,
      },
      { icon: IconBrandX, platformKey: "team2PlatformX", href: LINK_URL },
    ],
  },
  {
    id: "t2-5",
    initials: "YT",
    avatarVariant: "success",
    nameKey: "team2Member5Name",
    roleKey: "team2Member5Role",
    bioKey: "team2Member5Bio",
    departmentKey: "team2Member5Department",
    departmentVariant: "warning",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team2PlatformLinkedin",
        href: LINK_URL,
      },
      { icon: IconBrandX, platformKey: "team2PlatformX", href: LINK_URL },
    ],
  },
  {
    id: "t2-6",
    initials: "OH",
    avatarVariant: "default",
    nameKey: "team2Member6Name",
    roleKey: "team2Member6Role",
    bioKey: "team2Member6Bio",
    departmentKey: "team2Member6Department",
    departmentVariant: "outline",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team2PlatformLinkedin",
        href: LINK_URL,
      },
      {
        icon: IconBrandGithub,
        platformKey: "team2PlatformGithub",
        href: LINK_URL,
      },
    ],
  },
  {
    id: "t2-7",
    initials: "CD",
    avatarVariant: "info",
    nameKey: "team2Member7Name",
    roleKey: "team2Member7Role",
    bioKey: "team2Member7Bio",
    departmentKey: "team2Member7Department",
    departmentVariant: "secondary",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team2PlatformLinkedin",
        href: LINK_URL,
      },
      { icon: IconBrandX, platformKey: "team2PlatformX", href: LINK_URL },
    ],
  },
  {
    id: "t2-8",
    initials: "SF",
    avatarVariant: "warning",
    nameKey: "team2Member8Name",
    roleKey: "team2Member8Role",
    bioKey: "team2Member8Bio",
    departmentKey: "team2Member8Department",
    departmentVariant: "success",
    socials: [
      {
        icon: IconBrandLinkedin,
        platformKey: "team2PlatformLinkedin",
        href: LINK_URL,
      },
      {
        icon: IconBrandGithub,
        platformKey: "team2PlatformGithub",
        href: LINK_URL,
      },
    ],
  },
];

export function SocialCardRosterTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team2Intro}</p>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          aria-label={tm.team2GridAria}
          role="list"
        >
          {MEMBERS.map((member) => (
            <Card key={member.id} variant="default" role="listitem">
              <div className="flex flex-col items-center gap-3 p-5 text-center">
                <Avatar
                  fallback={member.initials}
                  size="lg"
                  variant={member.avatarVariant}
                />
                <div>
                  <p className="text-fg text-sm font-semibold">
                    {tm[member.nameKey]}
                  </p>
                  <p className="text-muted text-xs">{tm[member.roleKey]}</p>
                </div>
                <Badge variant={member.departmentVariant} size="sm">
                  {tm[member.departmentKey]}
                </Badge>
                <p className="text-muted text-xs leading-relaxed">
                  {tm[member.bioKey]}
                </p>
                <div className="border-border mt-1 flex items-center gap-3 border-t pt-3">
                  {member.socials.map((social) => (
                    <a
                      key={social.platformKey}
                      href={social.href}
                      className="text-muted hover:text-fg focus-visible:ring-brand rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={tm.team2SocialLinkAriaTemplate
                        .replace("{name}", tm[member.nameKey])
                        .replace("{platform}", tm[social.platformKey])}
                    >
                      <social.icon size={16} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
