"use client";

import Image from "next/image";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconHeart,
  IconPlayerPlayFilled,
  IconRepeat,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

interface XPost {
  id: string;
  handleKey: string;
  textKey: string;
  likes: number;
  reposts: number;
}

interface ImagePost {
  id: string;
  seed: string;
  handleKey: string;
  captionKey: string;
  likes: number;
}

const X_POSTS: XPost[] = [
  { id: "smt4-x-1", handleKey: "socialMediaTrending4XPost1Handle", textKey: "socialMediaTrending4XPost1Text", likes: 214, reposts: 38 },
  { id: "smt4-x-2", handleKey: "socialMediaTrending4XPost2Handle", textKey: "socialMediaTrending4XPost2Text", likes: 1092, reposts: 301 },
  { id: "smt4-x-3", handleKey: "socialMediaTrending4XPost3Handle", textKey: "socialMediaTrending4XPost3Text", likes: 57, reposts: 6 },
];

const INSTAGRAM_POSTS: ImagePost[] = [
  { id: "smt4-ig-1", seed: "smt4-ig-1", handleKey: "socialMediaTrending4InstagramPost1Handle", captionKey: "socialMediaTrending4InstagramPost1Caption", likes: 812 },
  { id: "smt4-ig-2", seed: "smt4-ig-2", handleKey: "socialMediaTrending4InstagramPost2Handle", captionKey: "socialMediaTrending4InstagramPost2Caption", likes: 245 },
  { id: "smt4-ig-3", seed: "smt4-ig-3", handleKey: "socialMediaTrending4InstagramPost3Handle", captionKey: "socialMediaTrending4InstagramPost3Caption", likes: 3067 },
];

const TIKTOK_POSTS: ImagePost[] = [
  { id: "smt4-tt-1", seed: "smt4-tt-1", handleKey: "socialMediaTrending4TiktokPost1Handle", captionKey: "socialMediaTrending4TiktokPost1Caption", likes: 5420 },
  { id: "smt4-tt-2", seed: "smt4-tt-2", handleKey: "socialMediaTrending4TiktokPost2Handle", captionKey: "socialMediaTrending4TiktokPost2Caption", likes: 918 },
  { id: "smt4-tt-3", seed: "smt4-tt-3", handleKey: "socialMediaTrending4TiktokPost3Handle", captionKey: "socialMediaTrending4TiktokPost3Caption", likes: 12300 },
];

export function PlatformTabsSocialMediaTrending() {
  const m = useMessages("pages") as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-col gap-2 text-center">
          <Badge variant="soft" pill size="sm" className="mx-auto w-fit">
            {smt.socialMediaTrending4Badge}
          </Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {smt.socialMediaTrending4Heading}
          </h2>
          <p className="text-muted mx-auto max-w-xl text-sm">
            {smt.socialMediaTrending4Subheading}
          </p>
        </div>

        <Tabs defaultValue="x">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="x">
                <IconBrandX size={15} className="mr-1.5" aria-hidden="true" />
                {smt.socialMediaTrending4TabXLabel}
              </TabsTrigger>
              <TabsTrigger value="instagram">
                <IconBrandInstagram size={15} className="mr-1.5" aria-hidden="true" />
                {smt.socialMediaTrending4TabInstagramLabel}
              </TabsTrigger>
              <TabsTrigger value="tiktok">
                <IconBrandTiktok size={15} className="mr-1.5" aria-hidden="true" />
                {smt.socialMediaTrending4TabTiktokLabel}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="x">
            <div className="mt-8 flex flex-col gap-4">
              {X_POSTS.map((post) => (
                <article
                  key={post.id}
                  className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar fallback={smt[post.handleKey]} size="sm" />
                    <span className="text-fg text-sm font-medium">
                      {smt[post.handleKey]}
                    </span>
                  </div>
                  <p className="text-fg text-sm leading-relaxed">
                    {smt[post.textKey]}
                  </p>
                  <div className="text-muted flex items-center gap-5 text-xs">
                    <span className="flex items-center gap-1.5">
                      <IconHeart size={13} aria-hidden="true" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconRepeat size={13} aria-hidden="true" />
                      {post.reposts}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="instagram">
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {INSTAGRAM_POSTS.map((post) => (
                <article
                  key={post.id}
                  className="border-border bg-surface overflow-hidden rounded-2xl border shadow-xs"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={placeholderImage(post.seed, "1x1")}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 p-3">
                    <span className="text-fg truncate text-xs font-medium">
                      {smt[post.handleKey]}
                    </span>
                    <p className="text-muted line-clamp-2 text-xs">
                      {smt[post.captionKey]}
                    </p>
                    <span className="text-muted flex items-center gap-1.5 text-xs">
                      <IconHeart size={12} aria-hidden="true" />
                      {post.likes}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tiktok">
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {TIKTOK_POSTS.map((post) => (
                <article
                  key={post.id}
                  className="border-border bg-surface relative overflow-hidden rounded-2xl border shadow-xs"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={placeholderImage(post.seed, "3x4")}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"
                    />
                    <span className="bg-bg/30 absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full backdrop-blur-sm">
                      <IconPlayerPlayFilled size={16} aria-hidden="true" className="ml-0.5 text-white" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-2.5">
                      <span className="truncate text-xs font-medium text-white">
                        {smt[post.handleKey]}
                      </span>
                      <span className="line-clamp-2 text-xs text-white/85">
                        {smt[post.captionKey]}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
