"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconShare,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

interface GridPost {
  id: string;
  seed: string;
  platformIcon: Icon;
  handleKey: string;
  captionKey: string;
  baseLikes: number;
  comments: number;
  shares: number;
}

const POSTS: GridPost[] = [
  {
    id: "smt2-post-1",
    seed: "smt2-post-1",
    platformIcon: IconBrandX,
    handleKey: "socialMediaTrending2Post1Handle",
    captionKey: "socialMediaTrending2Post1Caption",
    baseLikes: 128,
    comments: 24,
    shares: 9,
  },
  {
    id: "smt2-post-2",
    seed: "smt2-post-2",
    platformIcon: IconBrandInstagram,
    handleKey: "socialMediaTrending2Post2Handle",
    captionKey: "socialMediaTrending2Post2Caption",
    baseLikes: 542,
    comments: 61,
    shares: 33,
  },
  {
    id: "smt2-post-3",
    seed: "smt2-post-3",
    platformIcon: IconBrandTiktok,
    handleKey: "socialMediaTrending2Post3Handle",
    captionKey: "socialMediaTrending2Post3Caption",
    baseLikes: 967,
    comments: 118,
    shares: 204,
  },
  {
    id: "smt2-post-4",
    seed: "smt2-post-4",
    platformIcon: IconBrandInstagram,
    handleKey: "socialMediaTrending2Post4Handle",
    captionKey: "socialMediaTrending2Post4Caption",
    baseLikes: 231,
    comments: 18,
    shares: 12,
  },
  {
    id: "smt2-post-5",
    seed: "smt2-post-5",
    platformIcon: IconBrandX,
    handleKey: "socialMediaTrending2Post5Handle",
    captionKey: "socialMediaTrending2Post5Caption",
    baseLikes: 76,
    comments: 7,
    shares: 4,
  },
  {
    id: "smt2-post-6",
    seed: "smt2-post-6",
    platformIcon: IconBrandTiktok,
    handleKey: "socialMediaTrending2Post6Handle",
    captionKey: "socialMediaTrending2Post6Caption",
    baseLikes: 1420,
    comments: 302,
    shares: 411,
  },
];

function handleToggleLike(
  id: string,
  setLiked: Dispatch<SetStateAction<Record<string, boolean>>>,
) {
  setLiked((current) => ({ ...current, [id]: !current[id] }));
}

export function PostGridSocialMediaTrending() {
  const m = useMessages(
    "pages",
  ) as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <Badge variant="soft" pill size="sm" className="w-fit">
            {smt.socialMediaTrending2Badge}
          </Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {smt.socialMediaTrending2Heading}
          </h2>
          <p className="text-muted max-w-xl text-sm">
            {smt.socialMediaTrending2Subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => {
            const isLiked = !!liked[post.id];
            const likeCount = post.baseLikes + (isLiked ? 1 : 0);
            const Platform = post.platformIcon;
            return (
              <article
                key={post.id}
                className="border-border bg-surface flex flex-col overflow-hidden rounded-2xl border shadow-xs"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={placeholderImage(post.seed, "4x3")}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <span className="bg-bg/85 text-fg absolute top-2 right-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm">
                    <Platform size={14} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={placeholderImage(post.handleKey, "1x1")}
                      alt=""
                      fallback={smt[post.handleKey]}
                      size="sm"
                    />
                    <span className="text-fg truncate text-sm font-medium">
                      {smt[post.handleKey]}
                    </span>
                  </div>
                  <p className="text-muted flex-1 text-sm leading-relaxed">
                    {smt[post.captionKey]}
                  </p>
                  <div className="text-muted border-border flex items-center gap-4 border-t pt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id, setLiked)}
                      aria-pressed={isLiked}
                      aria-label={smt.socialMediaTrending2LikeAria}
                      className={
                        isLiked
                          ? "text-error flex items-center gap-1.5"
                          : "hover:text-fg flex items-center gap-1.5 transition-colors"
                      }
                    >
                      {isLiked ? (
                        <IconHeartFilled size={14} aria-hidden="true" />
                      ) : (
                        <IconHeart size={14} aria-hidden="true" />
                      )}
                      {likeCount}
                    </button>
                    <span className="flex items-center gap-1.5">
                      <IconMessageCircle size={14} aria-hidden="true" />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconShare size={14} aria-hidden="true" />
                      {post.shares}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
