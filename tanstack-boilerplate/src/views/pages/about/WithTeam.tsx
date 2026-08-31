"use client";

import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface TeamMember {
  name: string;
  role: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Sarah Chen", role: "Founder & CEO" },
  { name: "Marcus Rodriguez", role: "Chief Technology Officer" },
  { name: "Aisha Patel", role: "Head of Design" },
  { name: "Jonas Weber", role: "Engineering Lead" },
];

export function WithTeam() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-5 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-8 md:sticky md:top-24 md:col-span-1 md:h-fit">
          <div className="flex items-center gap-4 md:flex-col md:items-start">
            <Avatar
              src="/img/placeholders/ph-1x1-3.webp"
              alt={t.teamCompanyName}
              fallback="AC"
              size="lg"
            />
            <div className="flex flex-col gap-1">
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t.teamCompanyName}
              </Typography>
              <Typography variant="caption">{t.teamCompanySubtitle}</Typography>
            </div>
          </div>

          <a
            href={`mailto:${t.teamContactEmail}`}
            className="text-muted group hover:text-brand flex items-center gap-1 text-sm underline underline-offset-4 transition-colors"
          >
            {t.teamContactEmail}
            <IconArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="flex flex-col gap-10 md:col-span-4">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-6xl"
          >
            {t.teamHeading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted max-w-2xl">
            {t.teamBio}
          </Typography>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t.teamPhilosophyHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.teamPhilosophyParagraph}
              </Typography>
            </div>
            <div className="flex flex-col gap-3">
              <Typography
                variant="h3"
                className="text-xl font-medium tracking-tight"
              >
                {t.teamValuesHeading}
              </Typography>
              <Typography variant="body" className="text-muted">
                {t.teamValuesParagraph}
              </Typography>
            </div>
          </div>

          <AspectRatio
            ratio={2 / 1}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="/img/placeholders/ph-2x1-1.webp"
              alt={t.teamWorkspaceAlt}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          </AspectRatio>

          <div className="flex flex-col gap-4">
            <Typography
              variant="h3"
              className="text-xl font-medium tracking-tight"
            >
              {t.teamListHeading}
            </Typography>
            <div className="border-border divide-border flex flex-col divide-y rounded-2xl border">
              {TEAM_MEMBERS.map((member, index) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted font-mono text-sm tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                  <span className="text-muted text-sm">{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          <Typography variant="body" className="text-muted max-w-2xl">
            {t.teamClosing}
          </Typography>
        </div>
      </div>
    </section>
  );
}
