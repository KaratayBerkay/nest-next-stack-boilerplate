"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AvatarVariant } from "@/types/ui/Avatar-types";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

interface MutualEntry {
  id: string;
  variant: AvatarVariant;
  fallbackKey: string;
  nameKey: string;
}

const MUTUALS: MutualEntry[] = [
  { id: "mutual-1", variant: "brand", fallbackKey: "userProfile6Mutual1AvatarFallback", nameKey: "userProfile6Mutual1Name" },
  { id: "mutual-2", variant: "info", fallbackKey: "userProfile6Mutual2AvatarFallback", nameKey: "userProfile6Mutual2Name" },
  { id: "mutual-3", variant: "success", fallbackKey: "userProfile6Mutual3AvatarFallback", nameKey: "userProfile6Mutual3Name" },
];

const MUTUALS_EXTRA: MutualEntry[] = [
  { id: "mutual-extra-1", variant: "warning", fallbackKey: "userProfile6MutualExtra1AvatarFallback", nameKey: "userProfile6MutualExtra1Name" },
  { id: "mutual-extra-2", variant: "default", fallbackKey: "userProfile6MutualExtra2AvatarFallback", nameKey: "userProfile6MutualExtra2Name" },
];

export function SocialProofFollowRowUserProfile() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar
            fallback={up.userProfile6AvatarFallback}
            size="xl"
            variant="brand"
          />
          <h2 className="text-fg text-2xl font-semibold tracking-tight sm:text-3xl">
            {up.userProfile6Name}
          </h2>
          <p className="text-muted text-sm">{up.userProfile6Role}</p>
          <p className="text-fg max-w-md leading-relaxed">{up.userProfile6Bio}</p>
          <Button
            variant={following ? "outline" : "primary"}
            onClick={() => setFollowing((prev) => !prev)}
            aria-pressed={following}
            className="mt-1"
          >
            {following
              ? up.userProfile6FollowingButton
              : up.userProfile6FollowButton}
          </Button>
        </div>

        <dl className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <dt className="text-fg text-xl font-semibold">
              {up.userProfile6StatPostsValue}
            </dt>
            <dd className="text-muted text-xs">{up.userProfile6StatPostsLabel}</dd>
          </div>
          <div>
            <dt className="text-fg text-xl font-semibold">
              {up.userProfile6StatFollowersValue}
            </dt>
            <dd className="text-muted text-xs">
              {up.userProfile6StatFollowersLabel}
            </dd>
          </div>
          <div>
            <dt className="text-fg text-xl font-semibold">
              {up.userProfile6StatFollowingValue}
            </dt>
            <dd className="text-muted text-xs">
              {up.userProfile6StatFollowingLabel}
            </dd>
          </div>
        </dl>

        <Separator className="my-8" />

        <div className="border-border bg-surface rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <AvatarGroup max={3} size="sm">
              {MUTUALS.map((mutual) => (
                <Avatar
                  key={mutual.id}
                  fallback={up[mutual.fallbackKey]}
                  variant={mutual.variant}
                  size="sm"
                />
              ))}
            </AvatarGroup>
            <p className="text-muted flex-1 text-sm leading-relaxed">
              {up.userProfile6MutualSentence}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="text-brand mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            {expanded ? up.userProfile6ShowLessButton : up.userProfile6ShowMoreButton}
            {expanded ? (
              <IconChevronUp size={14} aria-hidden="true" />
            ) : (
              <IconChevronDown size={14} aria-hidden="true" />
            )}
          </button>
          {expanded && (
            <ul className="mt-3 flex flex-col gap-2">
              {MUTUALS_EXTRA.map((mutual) => (
                <li key={mutual.id} className="flex items-center gap-2">
                  <Avatar
                    fallback={up[mutual.fallbackKey]}
                    variant={mutual.variant}
                    size="xs"
                  />
                  <span className="text-fg text-sm">{up[mutual.nameKey]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
