"use client";

import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandX,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCommunityMessages } from "@/types/pages/community/CommunityMessages-types";

const LINK_URL = "#" as const;

const CARDS = [
  {
    icon: IconBrandX,
    name: "Twitter",
    labelKey: "community3Card1Label",
    descriptionKey: "community3Card1Description",
  },
  {
    icon: IconBrandGithub,
    name: "GitHub",
    labelKey: "community3Card2Label",
    descriptionKey: "community3Card2Description",
  },
  {
    icon: IconBrandDiscord,
    name: "Discord",
    labelKey: "community3Card3Label",
    descriptionKey: "community3Card3Description",
  },
];

export function PlatformCards() {
  const m = useMessages("pages") as unknown as PagesWithCommunityMessages;
  const co = m.community;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 text-left md:items-center md:text-center">
          <Badge variant="soft" pill size="sm">
            <IconUsers size={14} aria-hidden="true" className="mr-1.5" />
            {co.community3Badge}
          </Badge>
          <Typography variant="h2" className="text-4xl lg:text-5xl">
            {co.community3Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.community3SupportingStart}{" "}
            <span className="text-fg font-semibold">
              {co.community3SupportingEmphasis}
            </span>{" "}
            {co.community3SupportingEnd}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <a
              key={card.name}
              href={LINK_URL}
              aria-label={co[card.labelKey]}
              className="group border-border flex flex-col items-start gap-5 rounded-xl border p-8 shadow-xs transition-all hover:shadow-md"
            >
              <div className="bg-surface flex size-14 items-center justify-center rounded-full xl:size-16">
                <card.icon size={28} aria-hidden="true" className="xl:size-8" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                {card.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {co[card.descriptionKey]}
              </p>
            </a>
          ))}
        </div>
        <p className="text-muted mx-auto hidden max-w-xl text-center text-sm xl:block">
          {co.community3FooterText}
        </p>
      </div>
    </section>
  );
}
