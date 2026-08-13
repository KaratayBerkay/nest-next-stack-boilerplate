"use client";

import { IconScribble } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

const AVATARS = [
  {
    name: "Aria",
    initials: "AR",
    src: "https://picsum.photos/seed/cta30-avatar-1/64/64",
  },
  {
    name: "Leo",
    initials: "LE",
    src: "https://picsum.photos/seed/cta30-avatar-2/64/64",
  },
  {
    name: "Mia",
    initials: "MI",
    src: "https://picsum.photos/seed/cta30-avatar-3/64/64",
  },
  {
    name: "Noah",
    initials: "NO",
    src: "https://picsum.photos/seed/cta30-avatar-4/64/64",
  },
  {
    name: "Zoe",
    initials: "ZO",
    src: "https://picsum.photos/seed/cta30-avatar-5/64/64",
  },
] as const;

export function AvatarTeamCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center">
            {AVATARS.map((avatar, index) => (
              <Avatar
                key={avatar.name}
                src={avatar.src}
                alt={avatar.name}
                fallback={avatar.initials}
                size="lg"
                className={`ring-surface size-14 ring-2 ${index > 0 ? "-ml-3" : ""}`}
              />
            ))}
          </div>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.cta30Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-xl">
            {co.cta30Body}
          </Typography>
          <Button
            asChild
            variant="primary"
            size="lg"
            className="!rounded-full px-8"
          >
            <a href={LINK_URL}>{co.cta30Button}</a>
          </Button>
          <div className="text-muted flex items-center gap-2">
            <IconScribble
              size={18}
              className="rotate-[150deg]"
              aria-hidden="true"
            />
            <span className="text-sm">{co.cta30Caption}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
