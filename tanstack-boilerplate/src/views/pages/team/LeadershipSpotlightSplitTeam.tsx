"use client";

import { IconQuote } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithTeamMessages } from "@/types/pages/team/TeamMessages-types";

interface RestMember {
  id: string;
  initials: string;
  avatarVariant: AvatarVariant;
  nameKey: string;
  roleKey: string;
}

const REST: RestMember[] = [
  {
    id: "t3-1",
    initials: "AK",
    avatarVariant: "success",
    nameKey: "team3Member1Name",
    roleKey: "team3Member1Role",
  },
  {
    id: "t3-2",
    initials: "RD",
    avatarVariant: "info",
    nameKey: "team3Member2Name",
    roleKey: "team3Member2Role",
  },
  {
    id: "t3-3",
    initials: "NP",
    avatarVariant: "warning",
    nameKey: "team3Member3Name",
    roleKey: "team3Member3Role",
  },
  {
    id: "t3-4",
    initials: "FB",
    avatarVariant: "brand",
    nameKey: "team3Member4Name",
    roleKey: "team3Member4Role",
  },
  {
    id: "t3-5",
    initials: "IS",
    avatarVariant: "default",
    nameKey: "team3Member5Name",
    roleKey: "team3Member5Role",
  },
  {
    id: "t3-6",
    initials: "MW",
    avatarVariant: "info",
    nameKey: "team3Member6Name",
    roleKey: "team3Member6Role",
  },
];

export function LeadershipSpotlightSplitTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {tm.team3Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {tm.team3Heading}
            </h2>
            <p className="text-muted leading-relaxed">{tm.team3Intro}</p>

            <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6">
              <div className="flex items-center gap-4">
                <Avatar fallback="EV" size="xl" variant="brand" />
                <div>
                  <p className="text-fg text-base font-semibold">
                    {tm.team3LeaderName}
                  </p>
                  <p className="text-muted text-sm">{tm.team3LeaderRole}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <IconQuote
                  size={22}
                  aria-hidden="true"
                  className="text-brand mt-0.5 shrink-0"
                />
                <p className="text-fg text-sm leading-relaxed italic">
                  {tm.team3LeaderQuote}
                </p>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                {tm.team3LeaderBio}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-fg mb-6 text-lg font-semibold">
              {tm.team3RestHeading}
            </h3>
            <ul
              className="grid grid-cols-2 gap-5 sm:grid-cols-3"
              aria-label={tm.team3RestGridAria}
            >
              {REST.map((member) => (
                <li key={member.id} className="flex flex-col items-center gap-2 text-center">
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
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
