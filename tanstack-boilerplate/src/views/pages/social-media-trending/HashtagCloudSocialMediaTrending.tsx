"use client";

import { useState } from "react";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

interface Hashtag {
  id: string;
  labelKey: string;
  countKey: string;
  weight: "sm" | "md" | "lg";
}

interface TaggedPost {
  id: string;
  tagId: string;
  handleKey: string;
  captionKey: string;
  likes: number;
  comments: number;
}

const HASHTAGS: Hashtag[] = [
  { id: "travel", labelKey: "socialMediaTrending5Tag1Label", countKey: "socialMediaTrending5Tag1Count", weight: "lg" },
  { id: "foodie", labelKey: "socialMediaTrending5Tag2Label", countKey: "socialMediaTrending5Tag2Count", weight: "md" },
  { id: "techlaunch", labelKey: "socialMediaTrending5Tag3Label", countKey: "socialMediaTrending5Tag3Count", weight: "lg" },
  { id: "fitness", labelKey: "socialMediaTrending5Tag4Label", countKey: "socialMediaTrending5Tag4Count", weight: "sm" },
  { id: "diy", labelKey: "socialMediaTrending5Tag5Label", countKey: "socialMediaTrending5Tag5Count", weight: "md" },
  { id: "music", labelKey: "socialMediaTrending5Tag6Label", countKey: "socialMediaTrending5Tag6Count", weight: "sm" },
];

const POSTS: TaggedPost[] = [
  { id: "smt5-post-1", tagId: "travel", handleKey: "socialMediaTrending5Post1Handle", captionKey: "socialMediaTrending5Post1Caption", likes: 412, comments: 38 },
  { id: "smt5-post-2", tagId: "techlaunch", handleKey: "socialMediaTrending5Post2Handle", captionKey: "socialMediaTrending5Post2Caption", likes: 1290, comments: 204 },
  { id: "smt5-post-3", tagId: "foodie", handleKey: "socialMediaTrending5Post3Handle", captionKey: "socialMediaTrending5Post3Caption", likes: 156, comments: 22 },
  { id: "smt5-post-4", tagId: "travel", handleKey: "socialMediaTrending5Post4Handle", captionKey: "socialMediaTrending5Post4Caption", likes: 89, comments: 11 },
  { id: "smt5-post-5", tagId: "diy", handleKey: "socialMediaTrending5Post5Handle", captionKey: "socialMediaTrending5Post5Caption", likes: 233, comments: 19 },
];

const weightClasses: Record<Hashtag["weight"], string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base font-semibold",
};

export function HashtagCloudSocialMediaTrending() {
  const m = useMessages("pages") as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visiblePosts = activeTag
    ? POSTS.filter((post) => post.tagId === activeTag)
    : POSTS;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-2 text-center">
          <Badge variant="soft" pill size="sm" className="mx-auto w-fit">
            {smt.socialMediaTrending5Badge}
          </Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {smt.socialMediaTrending5Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl text-sm">
            {smt.socialMediaTrending5Subheading}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeTag === null
                ? "border-brand bg-brand text-brand-fg"
                : "border-border bg-surface text-muted hover:text-fg",
            )}
          >
            {smt.socialMediaTrending5AllLabel}
          </button>
          {HASHTAGS.map((tag) => {
            const isActive = activeTag === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setActiveTag(isActive ? null : tag.id)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 transition-colors",
                  weightClasses[tag.weight],
                  isActive
                    ? "border-brand bg-brand text-brand-fg"
                    : "border-border bg-surface text-fg hover:border-brand/50",
                )}
              >
                {smt[tag.labelKey]}
                <span className={cn("ml-1.5", isActive ? "text-brand-fg/75" : "text-muted")}>
                  {smt[tag.countKey]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="border-border bg-surface flex items-start gap-3 rounded-2xl border p-4"
            >
              <Avatar fallback={smt[post.handleKey]} size="sm" className="mt-0.5 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <span className="text-fg text-sm font-medium">
                  {smt[post.handleKey]}
                </span>
                <p className="text-muted text-sm leading-relaxed">
                  {smt[post.captionKey]}
                </p>
                <div className="text-muted mt-1 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <IconHeart size={13} aria-hidden="true" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconMessageCircle size={13} aria-hidden="true" />
                    {post.comments}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
