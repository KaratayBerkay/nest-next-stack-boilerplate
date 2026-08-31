"use client";

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
  departmentKey: string;
}

const MEMBERS: Member[] = [
  { id: "t5-1", initials: "AV", avatarVariant: "brand", nameKey: "team5Member1Name", roleKey: "team5Member1Role", departmentKey: "team5Member1Department" },
  { id: "t5-2", initials: "BG", avatarVariant: "info", nameKey: "team5Member2Name", roleKey: "team5Member2Role", departmentKey: "team5Member2Department" },
  { id: "t5-3", initials: "CP", avatarVariant: "success", nameKey: "team5Member3Name", roleKey: "team5Member3Role", departmentKey: "team5Member3Department" },
  { id: "t5-4", initials: "DH", avatarVariant: "warning", nameKey: "team5Member4Name", roleKey: "team5Member4Role", departmentKey: "team5Member4Department" },
  { id: "t5-5", initials: "EF", avatarVariant: "default", nameKey: "team5Member5Name", roleKey: "team5Member5Role", departmentKey: "team5Member5Department" },
  { id: "t5-6", initials: "GS", avatarVariant: "brand", nameKey: "team5Member6Name", roleKey: "team5Member6Role", departmentKey: "team5Member6Department" },
  { id: "t5-7", initials: "HL", avatarVariant: "info", nameKey: "team5Member7Name", roleKey: "team5Member7Role", departmentKey: "team5Member7Department" },
  { id: "t5-8", initials: "IK", avatarVariant: "success", nameKey: "team5Member8Name", roleKey: "team5Member8Role", departmentKey: "team5Member8Department" },
  { id: "t5-9", initials: "JR", avatarVariant: "warning", nameKey: "team5Member9Name", roleKey: "team5Member9Role", departmentKey: "team5Member9Department" },
  { id: "t5-10", initials: "KM", avatarVariant: "default", nameKey: "team5Member10Name", roleKey: "team5Member10Role", departmentKey: "team5Member10Department" },
];

export function MinimalTextListRosterTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team5Intro}</p>
          <p className="text-muted text-sm">
            {tm.team5CountTemplate
              .replace("{count}", String(MEMBERS.length))
              .replace("{departments}", "4")}
          </p>
        </div>

        <ul
          className="border-border divide-border mt-8 divide-y border-t"
          aria-label={tm.team5ListAria}
        >
          {MEMBERS.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
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
              <span className="text-muted shrink-0 text-xs">
                {tm[member.departmentKey]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
