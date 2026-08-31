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
}

interface Tier {
  id: string;
  labelKey: string;
  size: "lg" | "md" | "sm";
  members: Member[];
}

const TIERS: Tier[] = [
  {
    id: "leadership",
    labelKey: "team8TierLeadershipLabel",
    size: "lg",
    members: [
      {
        id: "t8-1",
        initials: "WC",
        avatarVariant: "brand",
        nameKey: "team8Member1Name",
        roleKey: "team8Member1Role",
      },
      {
        id: "t8-2",
        initials: "XD",
        avatarVariant: "brand",
        nameKey: "team8Member2Name",
        roleKey: "team8Member2Role",
      },
    ],
  },
  {
    id: "leads",
    labelKey: "team8TierLeadsLabel",
    size: "md",
    members: [
      {
        id: "t8-3",
        initials: "YE",
        avatarVariant: "info",
        nameKey: "team8Member3Name",
        roleKey: "team8Member3Role",
      },
      {
        id: "t8-4",
        initials: "ZF",
        avatarVariant: "success",
        nameKey: "team8Member4Name",
        roleKey: "team8Member4Role",
      },
      {
        id: "t8-5",
        initials: "AG",
        avatarVariant: "warning",
        nameKey: "team8Member5Name",
        roleKey: "team8Member5Role",
      },
      {
        id: "t8-6",
        initials: "BH",
        avatarVariant: "default",
        nameKey: "team8Member6Name",
        roleKey: "team8Member6Role",
      },
    ],
  },
  {
    id: "team",
    labelKey: "team8TierTeamLabel",
    size: "sm",
    members: [
      {
        id: "t8-7",
        initials: "CI",
        avatarVariant: "info",
        nameKey: "team8Member7Name",
        roleKey: "team8Member7Role",
      },
      {
        id: "t8-8",
        initials: "DJ",
        avatarVariant: "success",
        nameKey: "team8Member8Name",
        roleKey: "team8Member8Role",
      },
      {
        id: "t8-9",
        initials: "EK",
        avatarVariant: "warning",
        nameKey: "team8Member9Name",
        roleKey: "team8Member9Role",
      },
      {
        id: "t8-10",
        initials: "FL",
        avatarVariant: "default",
        nameKey: "team8Member10Name",
        roleKey: "team8Member10Role",
      },
      {
        id: "t8-11",
        initials: "GM",
        avatarVariant: "brand",
        nameKey: "team8Member11Name",
        roleKey: "team8Member11Role",
      },
      {
        id: "t8-12",
        initials: "HN",
        avatarVariant: "info",
        nameKey: "team8Member12Name",
        roleKey: "team8Member12Role",
      },
    ],
  },
];

export function OrgChartHierarchyTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team8Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team8Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team8Intro}</p>
        </div>

        <div className="mt-14 flex flex-col items-center">
          {TIERS.map((tier, tierIndex) => (
            <div key={tier.id} className="flex w-full flex-col items-center">
              {tierIndex > 0 && (
                <div className="bg-border h-8 w-px" aria-hidden="true" />
              )}
              <span className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
                {tm[tier.labelKey]}
              </span>
              <ul
                className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6"
                aria-label={tm[tier.labelKey]}
              >
                {tier.members.map((member) => (
                  <li
                    key={member.id}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <Avatar
                      fallback={member.initials}
                      size={
                        tier.size === "lg"
                          ? "lg"
                          : tier.size === "md"
                            ? "md"
                            : "sm"
                      }
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
              {tierIndex < TIERS.length - 1 && (
                <div className="border-border mx-auto mt-8 w-full max-w-md border-t border-dashed" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
