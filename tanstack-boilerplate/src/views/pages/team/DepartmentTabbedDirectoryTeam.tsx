"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithTeamMessages } from "@/types/pages/team/TeamMessages-types";

type DepartmentId = "all" | "engineering" | "design" | "product" | "marketing";

interface Member {
  id: string;
  initials: string;
  avatarVariant: AvatarVariant;
  department: Exclude<DepartmentId, "all">;
  nameKey: string;
  roleKey: string;
}

const DEPARTMENTS: { id: DepartmentId; labelKey: string }[] = [
  { id: "all", labelKey: "team6DeptAllLabel" },
  { id: "engineering", labelKey: "team6DeptEngineeringLabel" },
  { id: "design", labelKey: "team6DeptDesignLabel" },
  { id: "product", labelKey: "team6DeptProductLabel" },
  { id: "marketing", labelKey: "team6DeptMarketingLabel" },
];

const MEMBERS: Member[] = [
  { id: "t6-1", initials: "AM", avatarVariant: "brand", department: "engineering", nameKey: "team6Member1Name", roleKey: "team6Member1Role" },
  { id: "t6-2", initials: "BN", avatarVariant: "info", department: "engineering", nameKey: "team6Member2Name", roleKey: "team6Member2Role" },
  { id: "t6-3", initials: "CO", avatarVariant: "success", department: "engineering", nameKey: "team6Member3Name", roleKey: "team6Member3Role" },
  { id: "t6-4", initials: "DP", avatarVariant: "warning", department: "design", nameKey: "team6Member4Name", roleKey: "team6Member4Role" },
  { id: "t6-5", initials: "EQ", avatarVariant: "default", department: "design", nameKey: "team6Member5Name", roleKey: "team6Member5Role" },
  { id: "t6-6", initials: "FR", avatarVariant: "brand", department: "product", nameKey: "team6Member6Name", roleKey: "team6Member6Role" },
  { id: "t6-7", initials: "GS", avatarVariant: "info", department: "product", nameKey: "team6Member7Name", roleKey: "team6Member7Role" },
  { id: "t6-8", initials: "HT", avatarVariant: "success", department: "marketing", nameKey: "team6Member8Name", roleKey: "team6Member8Role" },
  { id: "t6-9", initials: "IU", avatarVariant: "warning", department: "marketing", nameKey: "team6Member9Name", roleKey: "team6Member9Role" },
  { id: "t6-10", initials: "JV", avatarVariant: "default", department: "engineering", nameKey: "team6Member10Name", roleKey: "team6Member10Role" },
];

function membersForDepartment(id: DepartmentId): Member[] {
  if (id === "all") return MEMBERS;
  return MEMBERS.filter((member) => member.department === id);
}

export function DepartmentTabbedDirectoryTeam() {
  const t = useMessages("pages") as unknown as PagesWithTeamMessages;
  const tm = t.team;
  const [activeDept, setActiveDept] = useState<DepartmentId>("all");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.team6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.team6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.team6Intro}</p>
        </div>

        <Tabs
          value={activeDept}
          onValueChange={(value) => setActiveDept(value as DepartmentId)}
          className="mt-10"
        >
          <div className="flex justify-center">
            <TabsList aria-label={tm.team6TabsAria}>
              {DEPARTMENTS.map((dept) => (
                <TabsTrigger key={dept.id} value={dept.id}>
                  {tm[dept.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {DEPARTMENTS.map((dept) => (
            <TabsContent key={dept.id} value={dept.id} className="mt-8">
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                {membersForDepartment(dept.id).map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <Avatar
                      fallback={member.initials}
                      size="md"
                      variant={member.avatarVariant}
                    />
                    <div>
                      <p className="text-fg text-sm font-semibold">
                        {tm[member.nameKey]}
                      </p>
                      <p className="text-muted text-xs">{tm[member.roleKey]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
