"use client";

import { IconQuote } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithTeamMessages } from "@/types/pages/team/TeamMessages-types";

interface Member {
  id: string;
  initials: string;
  avatarVariant: AvatarVariant;
  nameKey: string;
  roleKey: string;
  quoteKey: string;
}

const MEMBERS: Member[] = [
  { id: "t9-1", initials: "LO", avatarVariant: "brand", nameKey: "team9Member1Name", roleKey: "team9Member1Role", quoteKey: "team9Member1Quote" },
  { id: "t9-2", initials: "MP", avatarVariant: "info", nameKey: "team9Member2Name", roleKey: "team9Member2Role", quoteKey: "team9Member2Quote" },
  { id: "t9-3", initials: "NQ", avatarVariant: "success", nameKey: "team9Member3Name", roleKey: "team9Member3Role", quoteKey: "team9Member3Quote" },
  { id: "t9-4", initials: "OR", avatarVariant: "warning", nameKey: "team9Member4Name", roleKey: "team9Member4Role", quoteKey: "team9Member4Quote" },
  { id: "t9-5", initials: "PS", avatarVariant: "default", nameKey: "team9Member5Name", roleKey: "team9Member5Role", quoteKey: "team9Member5Quote" },
  { id: "t9-6", initials: "QT", avatarVariant: "brand", nameKey: "team9Member6Name", roleKey: "team9Member6Role", quoteKey: "team9Member6Quote" },
  { id: "t9-7", initials: "RU", avatarVariant: "info", nameKey: "team9Member7Name", roleKey: "team9Member7Role", quoteKey: "team9Member7Quote" },
  { id: "t9-8", initials: "SV", avatarVariant: "success", nameKey: "team9Member8Name", roleKey: "team9Member8Role", quoteKey: "team9Member8Quote" },
];

export function QuoteWallMasonryTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team9Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team9Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team9Intro}</p>
        </div>

        <div
          className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3"
          role="list"
          aria-label={tm.team9WallAria}
        >
          {MEMBERS.map((member) => (
            <div
              key={member.id}
              role="listitem"
              className="border-border bg-surface mb-5 flex break-inside-avoid flex-col gap-4 rounded-2xl border p-6"
            >
              <IconQuote size={22} aria-hidden="true" className="text-brand" />
              <p className="text-fg text-sm leading-relaxed">
                {tm[member.quoteKey]}
              </p>
              <div className="mt-auto flex items-center gap-3">
                <Avatar
                  fallback={member.initials}
                  size="sm"
                  variant={member.avatarVariant}
                />
                <div className="min-w-0">
                  <p className="text-fg truncate text-sm font-semibold">
                    {tm[member.nameKey]}
                  </p>
                  <p className="text-muted truncate text-xs">
                    {tm[member.roleKey]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
