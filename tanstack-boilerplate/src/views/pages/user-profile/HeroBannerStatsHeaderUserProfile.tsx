"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconMapPin,
  IconMessageCircle,
  IconRosetteDiscountCheckFilled,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

export function HeroBannerStatsHeaderUserProfile() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;
  const [following, setFollowing] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-2xl border">
          <div className="from-brand/40 via-brand/15 to-surface h-32 bg-gradient-to-br sm:h-44" />
          <div className="bg-bg px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="border-bg -mt-10 inline-flex rounded-full border-4 sm:-mt-12">
                <Avatar
                  fallback={up.userProfile1AvatarFallback}
                  size="xl"
                  variant="brand"
                />
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant={following ? "outline" : "primary"}
                  onClick={() => setFollowing((prev) => !prev)}
                  aria-pressed={following}
                >
                  {following
                    ? up.userProfile1FollowingButton
                    : up.userProfile1FollowButton}
                </Button>
                <Button variant="outline" leftIcon={<IconMessageCircle size={16} aria-hidden="true" />}>
                  {up.userProfile1MessageButton}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-fg text-2xl font-semibold tracking-tight sm:text-3xl">
                  {up.userProfile1Name}
                </h2>
                <IconRosetteDiscountCheckFilled
                  size={20}
                  className="text-brand shrink-0"
                  aria-label={up.userProfile1VerifiedBadge}
                />
                <Badge variant="soft" size="sm">
                  {up.userProfile1RoleBadge}
                </Badge>
              </div>
              <p className="text-muted text-sm">{up.userProfile1Handle}</p>
              <p className="text-fg max-w-2xl leading-relaxed">
                {up.userProfile1Bio}
              </p>
              <div className="text-muted flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <IconMapPin size={16} aria-hidden="true" />
                  {up.userProfile1Location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconCalendar size={16} aria-hidden="true" />
                  {up.userProfile1Joined}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            <dl className="grid grid-cols-3 gap-4 text-center sm:max-w-sm sm:text-left">
              <div>
                <dt className="text-fg text-xl font-semibold">
                  {up.userProfile1StatPostsValue}
                </dt>
                <dd className="text-muted text-xs">
                  {up.userProfile1StatPostsLabel}
                </dd>
              </div>
              <div>
                <dt className="text-fg text-xl font-semibold">
                  {up.userProfile1StatFollowersValue}
                </dt>
                <dd className="text-muted text-xs">
                  {up.userProfile1StatFollowersLabel}
                </dd>
              </div>
              <div>
                <dt className="text-fg text-xl font-semibold">
                  {up.userProfile1StatFollowingValue}
                </dt>
                <dd className="text-muted text-xs">
                  {up.userProfile1StatFollowingLabel}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
