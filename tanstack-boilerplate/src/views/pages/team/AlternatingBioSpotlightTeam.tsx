"use client";

import { IconSparkles } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithTeamMessages } from "@/types/pages/team/TeamMessages-types";

interface Member {
  id: string;
  initials: string;
  avatarVariant: AvatarVariant;
  nameKey: string;
  roleKey: string;
  bioKey: string;
  funFactKey: string;
}

const MEMBERS: Member[] = [
  {
    id: "t7-1",
    initials: "RM",
    avatarVariant: "brand",
    nameKey: "team7Member1Name",
    roleKey: "team7Member1Role",
    bioKey: "team7Member1Bio",
    funFactKey: "team7Member1FunFact",
  },
  {
    id: "t7-2",
    initials: "SW",
    avatarVariant: "info",
    nameKey: "team7Member2Name",
    roleKey: "team7Member2Role",
    bioKey: "team7Member2Bio",
    funFactKey: "team7Member2FunFact",
  },
  {
    id: "t7-3",
    initials: "KL",
    avatarVariant: "success",
    nameKey: "team7Member3Name",
    roleKey: "team7Member3Role",
    bioKey: "team7Member3Bio",
    funFactKey: "team7Member3FunFact",
  },
  {
    id: "t7-4",
    initials: "PB",
    avatarVariant: "warning",
    nameKey: "team7Member4Name",
    roleKey: "team7Member4Role",
    bioKey: "team7Member4Bio",
    funFactKey: "team7Member4FunFact",
  },
];

export function AlternatingBioSpotlightTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team7Intro}</p>
        </div>

        <div className="mt-14 flex flex-col gap-14">
          {MEMBERS.map((member, index) => {
            const reversed = index % 2 === 1;
            return (
              <div
                key={member.id}
                className={cn(
                  "flex flex-col items-center gap-8 sm:flex-row",
                  reversed && "sm:flex-row-reverse",
                )}
              >
                <div className="border-border bg-surface flex shrink-0 items-center justify-center rounded-3xl border p-8">
                  <Avatar
                    fallback={member.initials}
                    size="xl"
                    variant={member.avatarVariant}
                    className="size-24 text-2xl"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <div>
                    <p className="text-fg text-xl font-semibold">
                      {tm[member.nameKey]}
                    </p>
                    <p className="text-muted text-sm">{tm[member.roleKey]}</p>
                  </div>
                  <p className="text-muted leading-relaxed">
                    {tm[member.bioKey]}
                  </p>
                  <div className="text-fg flex items-center gap-2 text-sm">
                    <IconSparkles
                      size={16}
                      aria-hidden="true"
                      className="text-brand shrink-0"
                    />
                    <span className="font-medium">{tm.team7FunFactLabel}:</span>
                    <span className="text-muted">{tm[member.funFactKey]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
