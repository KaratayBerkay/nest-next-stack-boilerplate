"use client";

import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandReddit,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCommunityMessages } from "@/types/pages/community/CommunityMessages-types";

const LINK_URL = "#" as const;

interface Channel {
  icon: Icon;
  name: string;
  url: string;
  online: boolean;
  followers: string;
}

const CHANNELS: Channel[] = [
  {
    icon: IconBrandX,
    name: "X",
    url: "https://x.com/shadcnblocks",
    online: true,
    followers: "128,400",
  },
  {
    icon: IconBrandGithub,
    name: "GitHub",
    url: "https://github.com/shadcnblocks",
    online: true,
    followers: "41,200",
  },
  {
    icon: IconBrandDiscord,
    name: "Discord",
    url: "https://discord.gg/shadcnblocks",
    online: false,
    followers: "32,900",
  },
  {
    icon: IconBrandLinkedin,
    name: "LinkedIn",
    url: "https://linkedin.com/company/shadcnblocks",
    online: true,
    followers: "54,700",
  },
  {
    icon: IconBrandYoutube,
    name: "YouTube",
    url: "https://youtube.com/@shadcnblocks",
    online: false,
    followers: "218,300",
  },
  {
    icon: IconBrandReddit,
    name: "Reddit",
    url: "https://reddit.com/r/shadcnblocks",
    online: true,
    followers: "17,600",
  },
];

export function SocialChannels() {
  const m = useMessages("pages") as unknown as PagesWithCommunityMessages;
  const co = m.community;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography variant="h2" className="text-4xl lg:text-5xl">
            {co.community7Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.community7Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CHANNELS.map((channel) => (
            <a
              key={channel.name}
              href={LINK_URL}
              className="bg-surface hover:bg-surface-hover flex flex-col gap-4 rounded-xl p-6 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <channel.icon
                  size={20}
                  aria-hidden="true"
                  className="text-muted"
                />
                <span className="font-semibold">{channel.name}</span>
              </div>
              <span className="text-muted decoration-border text-sm underline underline-offset-4">
                {channel.url}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    channel.online ? "bg-success" : "bg-muted",
                  )}
                />
                <span className="text-sm">
                  {channel.online ? co.community7Online : co.community7Offline}
                </span>
              </div>
              <div className="border-border flex items-center justify-between border-t pt-4">
                <span className="text-muted text-sm">
                  {co.community7FollowersLabel}
                </span>
                <span className="text-base font-semibold">
                  {channel.followers}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
