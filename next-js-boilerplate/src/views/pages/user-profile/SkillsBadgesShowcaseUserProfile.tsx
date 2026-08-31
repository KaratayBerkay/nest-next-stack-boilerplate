"use client";

import {
  IconAward,
  IconFlame,
  IconMedal,
  IconTrophy,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

interface SkillEntry {
  id: string;
  nameKey: string;
  value: number;
}

const SKILLS: SkillEntry[] = [
  { id: "skill-1", nameKey: "userProfile5Skill1Name", value: 95 },
  { id: "skill-2", nameKey: "userProfile5Skill2Name", value: 88 },
  { id: "skill-3", nameKey: "userProfile5Skill3Name", value: 76 },
  { id: "skill-4", nameKey: "userProfile5Skill4Name", value: 62 },
];

interface AchievementEntry {
  id: string;
  icon: Icon;
  titleKey: string;
  dateKey: string;
}

const ACHIEVEMENTS: AchievementEntry[] = [
  {
    id: "achievement-1",
    icon: IconTrophy,
    titleKey: "userProfile5Achievement1Title",
    dateKey: "userProfile5Achievement1Date",
  },
  {
    id: "achievement-2",
    icon: IconMedal,
    titleKey: "userProfile5Achievement2Title",
    dateKey: "userProfile5Achievement2Date",
  },
  {
    id: "achievement-3",
    icon: IconFlame,
    titleKey: "userProfile5Achievement3Title",
    dateKey: "userProfile5Achievement3Date",
  },
  {
    id: "achievement-4",
    icon: IconAward,
    titleKey: "userProfile5Achievement4Title",
    dateKey: "userProfile5Achievement4Date",
  },
];

export function SkillsBadgesShowcaseUserProfile() {
  const t = useMessages("pages") as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar
            fallback={up.userProfile5AvatarFallback}
            size="xl"
            variant="gradient"
          />
          <h2 className="text-fg text-2xl font-semibold tracking-tight sm:text-3xl">
            {up.userProfile5Name}
          </h2>
          <p className="text-muted text-sm">{up.userProfile5Role}</p>
          <p className="text-fg max-w-xl leading-relaxed">
            {up.userProfile5Bio}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-fg text-lg font-semibold tracking-tight">
              {up.userProfile5SkillsHeading}
            </h3>
            <div className="mt-5 flex flex-col gap-5">
              {SKILLS.map((skill) => (
                <div key={skill.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-fg font-medium">
                      {up[skill.nameKey]}
                    </span>
                    <span className="text-muted">{skill.value}%</span>
                  </div>
                  <Progress
                    value={skill.value}
                    size="sm"
                    aria-label={up[skill.nameKey]}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-fg text-lg font-semibold tracking-tight">
              {up.userProfile5AchievementsHeading}
            </h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((achievement) => (
                <Card key={achievement.id} variant="default">
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <span className="bg-brand/10 flex size-10 items-center justify-center rounded-full">
                      <achievement.icon
                        size={20}
                        aria-hidden="true"
                        className="text-brand"
                      />
                    </span>
                    <p className="text-fg text-sm font-semibold">
                      {up[achievement.titleKey]}
                    </p>
                    <p className="text-muted text-xs">
                      {up[achievement.dateKey]}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
