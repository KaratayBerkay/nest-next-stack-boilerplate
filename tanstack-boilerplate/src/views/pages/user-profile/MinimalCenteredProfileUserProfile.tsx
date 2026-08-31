"use client";

import { useState } from "react";
import { IconBrandInstagram, IconBrandX, IconMail, IconWorld } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

export function MinimalCenteredProfileUserProfile() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;
  const [following, setFollowing] = useState(false);

  return (
    <section className="w-full py-20 lg:py-28">
      <div className="mx-auto flex max-w-xs flex-col items-center gap-4 px-6 text-center">
        <Avatar
          fallback={up.userProfile7AvatarFallback}
          size="xl"
          variant="default"
        />
        <div>
          <h2 className="text-fg text-xl font-semibold tracking-tight">
            {up.userProfile7Name}
          </h2>
          <p className="text-muted mt-1 text-sm">{up.userProfile7Tagline}</p>
        </div>
        <p className="text-muted text-sm leading-relaxed">{up.userProfile7Bio}</p>

        <div className="flex items-center gap-2">
          <IconButton
            icon={<IconWorld size={16} aria-hidden="true" />}
            label={up.userProfile7LinkWebsiteAria}
            variant="ghost"
            size="icon-sm"
          />
          <IconButton
            icon={<IconBrandX size={16} aria-hidden="true" />}
            label={up.userProfile7LinkTwitterAria}
            variant="ghost"
            size="icon-sm"
          />
          <IconButton
            icon={<IconBrandInstagram size={16} aria-hidden="true" />}
            label={up.userProfile7LinkInstagramAria}
            variant="ghost"
            size="icon-sm"
          />
          <IconButton
            icon={<IconMail size={16} aria-hidden="true" />}
            label={up.userProfile7LinkEmailAria}
            variant="ghost"
            size="icon-sm"
          />
        </div>

        <Button
          variant={following ? "outline" : "primary"}
          className="mt-2 w-full"
          onClick={() => setFollowing((prev) => !prev)}
          aria-pressed={following}
        >
          {following ? up.userProfile7FollowingButton : up.userProfile7FollowButton}
        </Button>
        <p className="text-muted text-xs">{up.userProfile7FollowerCountLabel}</p>
      </div>
    </section>
  );
}
