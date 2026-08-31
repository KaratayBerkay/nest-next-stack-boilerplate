"use client";

import { useState } from "react";
import { IconUsers } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

interface PersonEntry {
  id: string;
  avatarVariant: AvatarVariant;
  fallbackKey: string;
  nameKey: string;
  roleKey: string;
  bioKey: string;
  followersKey: string;
}

const PEOPLE: PersonEntry[] = [
  {
    id: "person-1",
    avatarVariant: "brand",
    fallbackKey: "userProfile4Person1AvatarFallback",
    nameKey: "userProfile4Person1Name",
    roleKey: "userProfile4Person1Role",
    bioKey: "userProfile4Person1Bio",
    followersKey: "userProfile4Person1Followers",
  },
  {
    id: "person-2",
    avatarVariant: "info",
    fallbackKey: "userProfile4Person2AvatarFallback",
    nameKey: "userProfile4Person2Name",
    roleKey: "userProfile4Person2Role",
    bioKey: "userProfile4Person2Bio",
    followersKey: "userProfile4Person2Followers",
  },
  {
    id: "person-3",
    avatarVariant: "success",
    fallbackKey: "userProfile4Person3AvatarFallback",
    nameKey: "userProfile4Person3Name",
    roleKey: "userProfile4Person3Role",
    bioKey: "userProfile4Person3Bio",
    followersKey: "userProfile4Person3Followers",
  },
  {
    id: "person-4",
    avatarVariant: "warning",
    fallbackKey: "userProfile4Person4AvatarFallback",
    nameKey: "userProfile4Person4Name",
    roleKey: "userProfile4Person4Role",
    bioKey: "userProfile4Person4Bio",
    followersKey: "userProfile4Person4Followers",
  },
];

export function CompactSummaryCardUserProfile() {
  const t = useMessages("pages") as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  function toggleFollow(id: string) {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-brand mx-auto inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
            <IconUsers size={14} aria-hidden="true" />
            {up.userProfile4Eyebrow}
          </span>
          <h2 className="text-fg text-2xl font-semibold tracking-tight sm:text-3xl">
            {up.userProfile4Heading}
          </h2>
          <p className="text-muted mx-auto max-w-md leading-relaxed">
            {up.userProfile4Intro}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PEOPLE.map((person) => {
            const isFollowing = followingIds.has(person.id);
            return (
              <Card key={person.id} variant="default">
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar
                      fallback={up[person.fallbackKey]}
                      variant={person.avatarVariant}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-fg truncate text-sm font-semibold">
                        {up[person.nameKey]}
                      </p>
                      <p className="text-muted truncate text-xs">
                        {up[person.roleKey]}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted line-clamp-2 text-sm leading-relaxed">
                    {up[person.bioKey]}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted text-xs">
                      {up[person.followersKey]}
                    </span>
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "primary"}
                      onClick={() => toggleFollow(person.id)}
                      aria-pressed={isFollowing}
                    >
                      {isFollowing
                        ? up.userProfile4FollowingButton
                        : up.userProfile4FollowButton}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
