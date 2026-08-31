"use client";

import { useState } from "react";
import Image from "next/image";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

interface FeaturablePost {
  id: string;
  seed: string;
  handleKey: string;
  captionKey: string;
  likes: number;
  comments: number;
}

const POSTS: FeaturablePost[] = [
  {
    id: "smt6-post-1",
    seed: "smt6-post-1",
    handleKey: "socialMediaTrending6Post1Handle",
    captionKey: "socialMediaTrending6Post1Caption",
    likes: 2840,
    comments: 316,
  },
  {
    id: "smt6-post-2",
    seed: "smt6-post-2",
    handleKey: "socialMediaTrending6Post2Handle",
    captionKey: "socialMediaTrending6Post2Caption",
    likes: 641,
    comments: 58,
  },
  {
    id: "smt6-post-3",
    seed: "smt6-post-3",
    handleKey: "socialMediaTrending6Post3Handle",
    captionKey: "socialMediaTrending6Post3Caption",
    likes: 199,
    comments: 27,
  },
  {
    id: "smt6-post-4",
    seed: "smt6-post-4",
    handleKey: "socialMediaTrending6Post4Handle",
    captionKey: "socialMediaTrending6Post4Caption",
    likes: 87,
    comments: 9,
  },
  {
    id: "smt6-post-5",
    seed: "smt6-post-5",
    handleKey: "socialMediaTrending6Post5Handle",
    captionKey: "socialMediaTrending6Post5Caption",
    likes: 1053,
    comments: 142,
  },
];

export function FeaturedPostListSocialMediaTrending() {
  const m = useMessages("pages") as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;
  const [selectedId, setSelectedId] = useState<string>(POSTS[0].id);

  const featured = POSTS.find((post) => post.id === selectedId) ?? POSTS[0];
  const rest = POSTS.filter((post) => post.id !== featured.id);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <Badge variant="soft" pill size="sm" className="w-fit">
            {smt.socialMediaTrending6Badge}
          </Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {smt.socialMediaTrending6Heading}
          </h2>
          <p className="text-muted max-w-xl text-sm">
            {smt.socialMediaTrending6Subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <article className="border-border bg-surface col-span-1 flex flex-col overflow-hidden rounded-2xl border shadow-xs lg:col-span-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={placeholderImage(featured.seed, "16x9")}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
              <Badge
                variant="secondary"
                size="sm"
                className="bg-bg/85 absolute top-3 left-3 backdrop-blur-sm"
              >
                {smt.socialMediaTrending6FeaturedLabel}
              </Badge>
            </div>
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={placeholderImage(featured.handleKey, "1x1")}
                  alt=""
                  fallback={smt[featured.handleKey]}
                  size="sm"
                />
                <span className="text-fg text-sm font-medium">
                  {smt[featured.handleKey]}
                </span>
              </div>
              <p className="text-fg text-base leading-relaxed">
                {smt[featured.captionKey]}
              </p>
              <div className="text-muted flex items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5">
                  <IconHeart size={15} aria-hidden="true" />
                  {featured.likes}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconMessageCircle size={15} aria-hidden="true" />
                  {featured.comments}
                </span>
              </div>
            </div>
          </article>

          <div className="col-span-1 flex flex-col gap-2 lg:col-span-2">
            {rest.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedId(post.id)}
                className={cn(
                  "border-border bg-surface flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-brand/50",
                )}
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={placeholderImage(post.seed, "4x3")}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-fg truncate text-sm font-medium">
                    {smt[post.handleKey]}
                  </span>
                  <p className="text-muted line-clamp-1 text-xs">
                    {smt[post.captionKey]}
                  </p>
                  <span className="text-muted flex items-center gap-1 text-xs">
                    <IconHeart size={11} aria-hidden="true" />
                    {post.likes}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
