"use client";

import Image from "next/image";
import { IconBolt, IconCode, IconFlame } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const STATS = [
  { value: "99", suffix: "%", labelKey: "a12Stat1Label" },
  { value: "24", suffix: "/7", labelKey: "a12Stat2Label" },
  { value: "10", suffix: "+ years", labelKey: "a12Stat3Label" },
] as const;

const CULTURE_CARDS = [
  { icon: IconCode, titleKey: "a12Card1Title", bodyKey: "a12Card1Body" },
  { icon: IconFlame, titleKey: "a12Card2Title", bodyKey: "a12Card2Body" },
  { icon: IconBolt, titleKey: "a12Card3Title", bodyKey: "a12Card3Body" },
] as const;

const TEAM_MEMBERS = [
  {
    name: "Nina Kowalski",
    roleKey: "a12Member1Role",
    initials: "NK",
    seed: "about12-member-1",
  },
  {
    name: "Tom Beckett",
    roleKey: "a12Member2Role",
    initials: "TB",
    seed: "about12-member-2",
  },
  {
    name: "Yuki Tanaka",
    roleKey: "a12Member3Role",
    initials: "YT",
    seed: "about12-member-3",
  },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function WithAgency() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 lg:gap-20 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Typography
                variant="h2"
                className="max-w-xl text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {t.a12Heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted max-w-md">
                {t.a12Body}
              </Typography>
            </div>
            <div className="flex gap-10">
              {STATS.map((stat) => (
                <div key={stat.labelKey} className="flex flex-col gap-1">
                  <Typography
                    variant="h2"
                    className="text-4xl font-bold tracking-tighter tabular-nums"
                  >
                    {stat.value}
                    {stat.suffix}
                  </Typography>
                  <Typography variant="caption">{t[stat.labelKey]}</Typography>
                </div>
              ))}
            </div>
          </div>
          <AspectRatio
            ratio={4 / 5}
            className="bg-surface relative rounded-2xl"
          >
            <Image
              src="https://picsum.photos/seed/about12-hero/800/1000"
              alt={t.a12ImageAlt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover"
            />
          </AspectRatio>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-16">
          <Typography
            variant="h3"
            className="max-w-md text-2xl font-medium tracking-tighter md:text-3xl"
          >
            {t.a12CultureHeading}
          </Typography>
          <Typography variant="body" className="text-muted">
            {t.a12CultureBody}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {CULTURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.titleKey} className="flex flex-col gap-4 p-8">
                <div className="bg-muted flex h-fit w-fit rounded-lg p-2">
                  <Icon size={20} className="text-brand" />
                </div>
                <Typography
                  variant="h3"
                  className="text-xl font-medium tracking-tight"
                >
                  {t[card.titleKey]}
                </Typography>
                <Typography variant="body" className="text-muted">
                  {t[card.bodyKey]}
                </Typography>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <Card
              key={member.name}
              className="flex flex-col items-center gap-3 p-8 text-center"
            >
              <Avatar
                src={`https://picsum.photos/seed/${member.seed}/128/128`}
                alt={member.name}
                fallback={member.initials}
                size="lg"
              />
              <div className="flex flex-col gap-1">
                <Typography
                  variant="h3"
                  className="text-lg font-medium tracking-tight"
                >
                  {member.name}
                </Typography>
                <Typography variant="caption">{t[member.roleKey]}</Typography>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
