"use client";

import { useMemo, useState } from "react";
import {
  IconHeart,
  IconMessage2,
  IconPhoto,
  IconVideo,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithUserProfileMessages } from "@/types/pages/user-profile/UserProfileMessages-types";

type MediaType = "photo" | "video";
type MediaFilter = "all" | MediaType;

interface PostTile {
  id: string;
  type: MediaType;
  altKey: string;
  likes: number;
  comments: number;
  tint: string;
}

const POSTS: PostTile[] = [
  {
    id: "grid-1",
    type: "photo",
    altKey: "userProfile8Post1Alt",
    likes: 412,
    comments: 22,
    tint: "bg-brand/20",
  },
  {
    id: "grid-2",
    type: "video",
    altKey: "userProfile8Post2Alt",
    likes: 890,
    comments: 54,
    tint: "bg-info/20",
  },
  {
    id: "grid-3",
    type: "photo",
    altKey: "userProfile8Post3Alt",
    likes: 231,
    comments: 11,
    tint: "bg-success/20",
  },
  {
    id: "grid-4",
    type: "photo",
    altKey: "userProfile8Post4Alt",
    likes: 156,
    comments: 9,
    tint: "bg-warning/20",
  },
  {
    id: "grid-5",
    type: "video",
    altKey: "userProfile8Post5Alt",
    likes: 674,
    comments: 41,
    tint: "bg-brand/15",
  },
  {
    id: "grid-6",
    type: "photo",
    altKey: "userProfile8Post6Alt",
    likes: 88,
    comments: 4,
    tint: "bg-info/15",
  },
  {
    id: "grid-7",
    type: "photo",
    altKey: "userProfile8Post7Alt",
    likes: 305,
    comments: 17,
    tint: "bg-success/15",
  },
  {
    id: "grid-8",
    type: "video",
    altKey: "userProfile8Post8Alt",
    likes: 512,
    comments: 33,
    tint: "bg-warning/15",
  },
  {
    id: "grid-9",
    type: "photo",
    altKey: "userProfile8Post9Alt",
    likes: 199,
    comments: 13,
    tint: "bg-brand/25",
  },
];

export function PostsGridGalleryUserProfile() {
  const t = useMessages("pages") as unknown as PagesWithUserProfileMessages;
  const up = t.userProfile;
  const [following, setFollowing] = useState(false);
  const [filter, setFilter] = useState<MediaFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return POSTS;
    return POSTS.filter((post) => post.type === filter);
  }, [filter]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              fallback={up.userProfile8AvatarFallback}
              size="md"
              variant="info"
            />
            <div>
              <p className="text-fg text-sm font-semibold">
                {up.userProfile8Name}
              </p>
              <p className="text-muted text-xs">{up.userProfile8Handle}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant={following ? "outline" : "primary"}
            onClick={() => setFollowing((prev) => !prev)}
            aria-pressed={following}
          >
            {following
              ? up.userProfile8FollowingButton
              : up.userProfile8FollowButton}
          </Button>
        </div>

        <div className="mt-6 flex justify-center">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as MediaFilter);
            }}
            aria-label={up.userProfile8FilterGroupAria}
          >
            <ToggleGroupItem value="all" size="sm">
              {up.userProfile8FilterAll}
            </ToggleGroupItem>
            <ToggleGroupItem value="photo" size="sm">
              {up.userProfile8FilterPhotos}
            </ToggleGroupItem>
            <ToggleGroupItem value="video" size="sm">
              {up.userProfile8FilterVideos}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {filtered.map((post) => (
            <button
              key={post.id}
              type="button"
              aria-label={up[post.altKey]}
              className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg ${post.tint}`}
            >
              <span className="text-fg/50 absolute top-2 left-2">
                {post.type === "video" ? (
                  <IconVideo size={16} aria-hidden="true" />
                ) : (
                  <IconPhoto size={16} aria-hidden="true" />
                )}
              </span>
              <span className="bg-fg/60 text-bg absolute inset-0 flex items-center justify-center gap-3 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="inline-flex items-center gap-1">
                  <IconHeart size={14} aria-hidden="true" />
                  {post.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconMessage2 size={14} aria-hidden="true" />
                  {post.comments}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
