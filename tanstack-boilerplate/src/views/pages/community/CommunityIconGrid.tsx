"use client";

import {
  IconBrandBluesky,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandSlack,
  IconBrandX,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCommunityMessages } from "@/types/pages/community/CommunityMessages-types";

const LINK_URL = "#" as const;

interface Channel {
  icon: Icon;
  name: string;
  descriptionKey: string;
}

const CHANNELS: Channel[] = [
  {
    icon: IconBrandX,
    name: "Twitter",
    descriptionKey: "community6Card1Description",
  },
  {
    icon: IconBrandGithub,
    name: "GitHub",
    descriptionKey: "community6Card2Description",
  },
  {
    icon: IconBrandDiscord,
    name: "Discord",
    descriptionKey: "community6Card3Description",
  },
  {
    icon: IconBrandLinkedin,
    name: "LinkedIn",
    descriptionKey: "community6Card4Description",
  },
  {
    icon: IconBrandSlack,
    name: "Slack",
    descriptionKey: "community6Card5Description",
  },
  {
    icon: IconBrandBluesky,
    name: "Bluesky",
    descriptionKey: "community6Card6Description",
  },
];

export function CommunityIconGrid() {
  const m = useMessages("pages") as unknown as PagesWithCommunityMessages;
  const co = m.community;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface rounded-3xl border px-6 py-16 lg:px-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <Typography variant="h2" className="text-4xl lg:text-5xl">
              {co.community6Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.community6Description}
            </Typography>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {CHANNELS.map((channel) => (
              <Card
                key={channel.name}
                className="group transition-shadow hover:shadow-md"
              >
                <a
                  href={LINK_URL}
                  className="flex h-full flex-col items-center gap-3 p-6 text-center"
                >
                  <span className="bg-surface group-hover:bg-surface-hover border-border flex size-14 items-center justify-center rounded-full border border-dashed p-3 transition-colors">
                    <channel.icon
                      size={24}
                      aria-hidden="true"
                      className="text-muted"
                    />
                  </span>
                  <Typography variant="h5">{channel.name}</Typography>
                  <Typography variant="caption" className="leading-relaxed">
                    {co[channel.descriptionKey]}
                  </Typography>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
