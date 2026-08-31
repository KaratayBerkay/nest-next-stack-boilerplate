"use client";

import { useState } from "react";
import {
  IconBriefcase,
  IconCalendar,
  IconHeart,
  IconMapPin,
  IconMessage2,
  IconSchool,
  IconShieldCheck,
  IconStar,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

interface PostTile {
  id: string;
  captionKey: string;
  likes: number;
  comments: number;
  tint: string;
}

const POSTS: PostTile[] = [
  {
    id: "post-1",
    captionKey: "userProfile3Post1Caption",
    likes: 128,
    comments: 12,
    tint: "bg-brand/20",
  },
  {
    id: "post-2",
    captionKey: "userProfile3Post2Caption",
    likes: 84,
    comments: 6,
    tint: "bg-info/20",
  },
  {
    id: "post-3",
    captionKey: "userProfile3Post3Caption",
    likes: 341,
    comments: 29,
    tint: "bg-success/20",
  },
  {
    id: "post-4",
    captionKey: "userProfile3Post4Caption",
    likes: 57,
    comments: 3,
    tint: "bg-warning/20",
  },
  {
    id: "post-5",
    captionKey: "userProfile3Post5Caption",
    likes: 212,
    comments: 18,
    tint: "bg-brand/15",
  },
  {
    id: "post-6",
    captionKey: "userProfile3Post6Caption",
    likes: 96,
    comments: 8,
    tint: "bg-info/15",
  },
];

interface AboutRow {
  id: string;
  icon: Icon;
  labelKey: string;
  valueKey: string;
}

const ABOUT_ROWS: AboutRow[] = [
  {
    id: "about-location",
    icon: IconMapPin,
    labelKey: "userProfile3LocationLabel",
    valueKey: "userProfile3AboutLocation",
  },
  {
    id: "about-work",
    icon: IconBriefcase,
    labelKey: "userProfile3WorkLabel",
    valueKey: "userProfile3AboutWork",
  },
  {
    id: "about-education",
    icon: IconSchool,
    labelKey: "userProfile3EducationLabel",
    valueKey: "userProfile3AboutEducation",
  },
  {
    id: "about-joined",
    icon: IconCalendar,
    labelKey: "userProfile3JoinedLabel",
    valueKey: "userProfile3AboutJoined",
  },
];

interface BadgeEntry {
  id: string;
  icon: Icon;
  titleKey: string;
  descKey: string;
}

const BADGES: BadgeEntry[] = [
  {
    id: "badge-1",
    icon: IconTrophy,
    titleKey: "userProfile3Badge1Title",
    descKey: "userProfile3Badge1Desc",
  },
  {
    id: "badge-2",
    icon: IconStar,
    titleKey: "userProfile3Badge2Title",
    descKey: "userProfile3Badge2Desc",
  },
  {
    id: "badge-3",
    icon: IconShieldCheck,
    titleKey: "userProfile3Badge3Title",
    descKey: "userProfile3Badge3Desc",
  },
  {
    id: "badge-4",
    icon: IconUsers,
    titleKey: "userProfile3Badge4Title",
    descKey: "userProfile3Badge4Desc",
  },
];

export function TabbedPostsAboutBadgesUserProfile() {
  const t = useMessages("pages") as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;
  const [following, setFollowing] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              fallback={up.userProfile3AvatarFallback}
              size="lg"
              variant="success"
            />
            <div>
              <p className="text-fg text-base font-semibold">
                {up.userProfile3Name}
              </p>
              <p className="text-muted text-sm">{up.userProfile3Handle}</p>
            </div>
          </div>
          <Button
            variant={following ? "outline" : "primary"}
            onClick={() => setFollowing((prev) => !prev)}
            aria-pressed={following}
          >
            {following
              ? up.userProfile3FollowingButton
              : up.userProfile3FollowButton}
          </Button>
        </div>

        <Tabs defaultValue="posts" className="mt-8">
          <TabsList>
            <TabsTrigger value="posts">
              {up.userProfile3NavPostsLabel}
            </TabsTrigger>
            <TabsTrigger value="about">
              {up.userProfile3NavAboutLabel}
            </TabsTrigger>
            <TabsTrigger value="badges">
              {up.userProfile3NavBadgesLabel}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {POSTS.map((post) => (
                <div
                  key={post.id}
                  className="border-border flex flex-col overflow-hidden rounded-lg border"
                >
                  <div
                    className={`flex aspect-square items-center justify-center ${post.tint}`}
                  >
                    <span className="text-fg/40 text-3xl font-semibold">
                      {up[post.captionKey].charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <p className="text-fg line-clamp-2 text-sm">
                      {up[post.captionKey]}
                    </p>
                    <div className="text-muted flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <IconHeart size={14} aria-hidden="true" />
                        {post.likes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IconMessage2 size={14} aria-hidden="true" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <p className="text-fg leading-relaxed">{up.userProfile3AboutBio}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {ABOUT_ROWS.map((row) => (
                <li key={row.id} className="flex items-center gap-3 text-sm">
                  <span className="border-border bg-surface flex size-8 shrink-0 items-center justify-center rounded-lg border">
                    <row.icon
                      size={16}
                      aria-hidden="true"
                      className="text-fg"
                    />
                  </span>
                  <span className="text-muted">{up[row.labelKey]}</span>
                  <span className="text-fg font-medium">
                    {up[row.valueKey]}
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {BADGES.map((badge) => (
                <Card key={badge.id} variant="default">
                  <div className="flex items-start gap-3 p-4">
                    <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <badge.icon
                        size={20}
                        aria-hidden="true"
                        className="text-brand"
                      />
                    </span>
                    <div>
                      <p className="text-fg text-sm font-semibold">
                        {up[badge.titleKey]}
                      </p>
                      <p className="text-muted mt-1 text-xs leading-relaxed">
                        {up[badge.descKey]}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
