"use client";

import { useState } from "react";
import Image from "next/image";
import { IconHeart } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PlaceholderAspect } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

interface MasonryPost {
  id: string;
  seed: string;
  aspect: PlaceholderAspect;
  handleKey: string;
  captionKey: string;
  likes: number;
}

const POSTS: MasonryPost[] = [
  {
    id: "smt3-post-1",
    seed: "smt3-post-1",
    aspect: "4x5",
    handleKey: "socialMediaTrending3Post1Handle",
    captionKey: "socialMediaTrending3Post1Caption",
    likes: 341,
  },
  {
    id: "smt3-post-2",
    seed: "smt3-post-2",
    aspect: "1x1",
    handleKey: "socialMediaTrending3Post2Handle",
    captionKey: "socialMediaTrending3Post2Caption",
    likes: 92,
  },
  {
    id: "smt3-post-3",
    seed: "smt3-post-3",
    aspect: "3x4",
    handleKey: "socialMediaTrending3Post3Handle",
    captionKey: "socialMediaTrending3Post3Caption",
    likes: 618,
  },
  {
    id: "smt3-post-4",
    seed: "smt3-post-4",
    aspect: "16x9",
    handleKey: "socialMediaTrending3Post4Handle",
    captionKey: "socialMediaTrending3Post4Caption",
    likes: 205,
  },
  {
    id: "smt3-post-5",
    seed: "smt3-post-5",
    aspect: "1x1",
    handleKey: "socialMediaTrending3Post5Handle",
    captionKey: "socialMediaTrending3Post5Caption",
    likes: 77,
  },
  {
    id: "smt3-post-6",
    seed: "smt3-post-6",
    aspect: "4x5",
    handleKey: "socialMediaTrending3Post6Handle",
    captionKey: "socialMediaTrending3Post6Caption",
    likes: 453,
  },
  {
    id: "smt3-post-7",
    seed: "smt3-post-7",
    aspect: "3x4",
    handleKey: "socialMediaTrending3Post7Handle",
    captionKey: "socialMediaTrending3Post7Caption",
    likes: 129,
  },
];

export function MasonryFeedSocialMediaTrending() {
  const m = useMessages(
    "pages",
  ) as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;
  const [showCaptions, setShowCaptions] = useState<boolean>(true);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="soft" pill size="sm" className="w-fit">
              {smt.socialMediaTrending3Badge}
            </Badge>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {smt.socialMediaTrending3Heading}
            </h2>
            <p className="text-muted max-w-xl text-sm">
              {smt.socialMediaTrending3Subheading}
            </p>
          </div>
          <Switch
            label={smt.socialMediaTrending3ToggleLabel}
            checked={showCaptions}
            onChange={(event) => setShowCaptions(event.target.checked)}
            switchSize="sm"
          />
        </div>

        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
          {POSTS.map((post) => (
            <article
              key={post.id}
              className="border-border bg-surface relative break-inside-avoid overflow-hidden rounded-2xl border shadow-xs"
            >
              <div
                className="relative w-full"
                style={{ aspectRatio: post.aspect.replace("x", " / ") }}
              >
                <Image
                  src={placeholderImage(post.seed, post.aspect)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
                {showCaptions && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
                      <span className="truncate text-xs font-medium text-white">
                        {smt[post.handleKey]}
                      </span>
                      <p className="line-clamp-2 text-xs text-white/85">
                        {smt[post.captionKey]}
                      </p>
                    </div>
                  </>
                )}
                <Badge
                  variant="secondary"
                  size="sm"
                  className="bg-bg/85 text-fg absolute top-2 right-2 gap-1 backdrop-blur-sm"
                >
                  <IconHeart size={11} aria-hidden="true" />
                  {post.likes}
                </Badge>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
