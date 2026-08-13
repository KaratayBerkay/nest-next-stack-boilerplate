"use client";

import {
  IconArrowUpRight,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCommunityMessages } from "@/types/pages/community/CommunityMessages-types";

const LINK_URL = "#" as const;

const CARDS = [
  {
    icon: IconBrandX,
    name: "X",
    labelKey: "community2Card1Label",
    descriptionKey: "community2Card1Description",
  },
  {
    icon: IconBrandLinkedin,
    name: "LinkedIn",
    labelKey: "community2Card2Label",
    descriptionKey: "community2Card2Description",
  },
  {
    icon: IconBrandGithub,
    name: "GitHub",
    labelKey: "community2Card3Label",
    descriptionKey: "community2Card3Description",
  },
  {
    icon: IconBrandDiscord,
    name: "Discord",
    labelKey: "community2Card4Label",
    descriptionKey: "community2Card4Description",
  },
];

export function CommunityLinkGrid() {
  const m = useMessages("pages") as unknown as PagesWithCommunityMessages;
  const co = m.community;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          <Typography variant="h2" className="text-4xl lg:text-5xl">
            {co.community2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted font-medium">
            {co.community2Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <a
              key={card.name}
              href={LINK_URL}
              aria-label={co[card.labelKey]}
              className="hover:bg-surface-hover group border-border flex flex-col gap-8 rounded-xl border p-6 transition-colors"
            >
              <div className="flex items-center justify-between">
                <card.icon size={32} aria-hidden="true" />
                <IconArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="text-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  {card.name}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {co[card.descriptionKey]}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
