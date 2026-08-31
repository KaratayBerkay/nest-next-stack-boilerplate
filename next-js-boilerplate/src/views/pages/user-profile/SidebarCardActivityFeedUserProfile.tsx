"use client";

import { useState } from "react";
import {
  IconBookmark,
  IconMessage2,
  IconStar,
  IconUserPlus,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

interface ActivityEntry {
  id: string;
  icon: Icon;
  textKey: string;
  timeKey: string;
}

const ACTIVITY: ActivityEntry[] = [
  {
    id: "activity-1",
    icon: IconStar,
    textKey: "userProfile2Activity1Text",
    timeKey: "userProfile2Activity1Time",
  },
  {
    id: "activity-2",
    icon: IconMessage2,
    textKey: "userProfile2Activity2Text",
    timeKey: "userProfile2Activity2Time",
  },
  {
    id: "activity-3",
    icon: IconBookmark,
    textKey: "userProfile2Activity3Text",
    timeKey: "userProfile2Activity3Time",
  },
  {
    id: "activity-4",
    icon: IconUserPlus,
    textKey: "userProfile2Activity4Text",
    timeKey: "userProfile2Activity4Time",
  },
  {
    id: "activity-5",
    icon: IconStar,
    textKey: "userProfile2Activity5Text",
    timeKey: "userProfile2Activity5Time",
  },
];

const INTEREST_KEYS = [
  "userProfile2Interest1",
  "userProfile2Interest2",
  "userProfile2Interest3",
  "userProfile2Interest4",
];

export function SidebarCardActivityFeedUserProfile() {
  const t = useMessages("pages") as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;
  const [following, setFollowing] = useState(true);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
            <Card variant="default">
              <div className="flex flex-col gap-5 p-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    fallback={up.userProfile2AvatarFallback}
                    size="lg"
                    variant="info"
                  />
                  <div className="min-w-0">
                    <p className="text-fg truncate text-base font-semibold">
                      {up.userProfile2Name}
                    </p>
                    <p className="text-muted truncate text-sm">
                      {up.userProfile2Role}
                    </p>
                  </div>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {up.userProfile2Bio}
                </p>
                <div className="flex flex-col gap-2">
                  <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                    {up.userProfile2InterestsLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {INTEREST_KEYS.map((key) => (
                      <Badge key={key} variant="secondary" size="sm">
                        {up[key]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-fg font-semibold">
                      {up.userProfile2FollowersValue}
                    </p>
                    <p className="text-muted text-xs">
                      {up.userProfile2FollowersLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-fg font-semibold">
                      {up.userProfile2FollowingValue}
                    </p>
                    <p className="text-muted text-xs">
                      {up.userProfile2FollowingLabel}
                    </p>
                  </div>
                </div>
                <Button
                  variant={following ? "outline" : "primary"}
                  onClick={() => setFollowing((prev) => !prev)}
                  aria-pressed={following}
                >
                  {following
                    ? up.userProfile2FollowingButton
                    : up.userProfile2FollowButton}
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-fg text-xl font-semibold tracking-tight">
              {up.userProfile2ActivityHeading}
            </h2>
            <ul className="border-border mt-5 flex flex-col divide-y rounded-xl border">
              {ACTIVITY.map((entry) => (
                <li key={entry.id} className="flex items-start gap-4 p-4">
                  <span className="border-border bg-surface flex size-9 shrink-0 items-center justify-center rounded-full border">
                    <entry.icon
                      size={18}
                      aria-hidden="true"
                      className="text-fg"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-fg text-sm">{up[entry.textKey]}</p>
                    <p className="text-muted mt-0.5 text-xs">
                      {up[entry.timeKey]}
                    </p>
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
