"use client";

import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFlame,
  IconHeart,
  IconMessageCircle,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useScrollFadeX } from "@/hooks/useScrollFadeX";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

interface ClipSeed {
  id: string;
  seed: string;
  handleKey: string;
  captionKey: string;
  durationKey: string;
  likesKey: string;
  commentsKey: string;
  thumbAriaKey: string;
}

const CLIPS: ClipSeed[] = [
  {
    id: "smt1-clip-1",
    seed: "smt1-clip-1",
    handleKey: "socialMediaTrending1Clip1Handle",
    captionKey: "socialMediaTrending1Clip1Caption",
    durationKey: "socialMediaTrending1Clip1Duration",
    likesKey: "socialMediaTrending1Clip1Likes",
    commentsKey: "socialMediaTrending1Clip1Comments",
    thumbAriaKey: "socialMediaTrending1Clip1ThumbAria",
  },
  {
    id: "smt1-clip-2",
    seed: "smt1-clip-2",
    handleKey: "socialMediaTrending1Clip2Handle",
    captionKey: "socialMediaTrending1Clip2Caption",
    durationKey: "socialMediaTrending1Clip2Duration",
    likesKey: "socialMediaTrending1Clip2Likes",
    commentsKey: "socialMediaTrending1Clip2Comments",
    thumbAriaKey: "socialMediaTrending1Clip2ThumbAria",
  },
  {
    id: "smt1-clip-3",
    seed: "smt1-clip-3",
    handleKey: "socialMediaTrending1Clip3Handle",
    captionKey: "socialMediaTrending1Clip3Caption",
    durationKey: "socialMediaTrending1Clip3Duration",
    likesKey: "socialMediaTrending1Clip3Likes",
    commentsKey: "socialMediaTrending1Clip3Comments",
    thumbAriaKey: "socialMediaTrending1Clip3ThumbAria",
  },
  {
    id: "smt1-clip-4",
    seed: "smt1-clip-4",
    handleKey: "socialMediaTrending1Clip4Handle",
    captionKey: "socialMediaTrending1Clip4Caption",
    durationKey: "socialMediaTrending1Clip4Duration",
    likesKey: "socialMediaTrending1Clip4Likes",
    commentsKey: "socialMediaTrending1Clip4Comments",
    thumbAriaKey: "socialMediaTrending1Clip4ThumbAria",
  },
  {
    id: "smt1-clip-5",
    seed: "smt1-clip-5",
    handleKey: "socialMediaTrending1Clip5Handle",
    captionKey: "socialMediaTrending1Clip5Caption",
    durationKey: "socialMediaTrending1Clip5Duration",
    likesKey: "socialMediaTrending1Clip5Likes",
    commentsKey: "socialMediaTrending1Clip5Comments",
    thumbAriaKey: "socialMediaTrending1Clip5ThumbAria",
  },
];

export function VideoClipCarouselSocialMediaTrending() {
  const m = useMessages("pages") as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;
  const trackRef = useScrollFadeX<HTMLDivElement>();

  const scrollByCard = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 224, behavior: "smooth" });
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="soft" pill size="sm" className="w-fit gap-1.5">
              <IconFlame size={14} aria-hidden="true" />
              {smt.socialMediaTrending1Badge}
            </Badge>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {smt.socialMediaTrending1Heading}
            </h2>
            <p className="text-muted max-w-xl text-sm">
              {smt.socialMediaTrending1Subheading}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <IconButton
              icon={<IconChevronLeft size={18} aria-hidden="true" />}
              label={smt.socialMediaTrending1PrevAria}
              variant="outline"
              size="icon"
              onClick={() => scrollByCard(-1)}
            />
            <IconButton
              icon={<IconChevronRight size={18} aria-hidden="true" />}
              label={smt.socialMediaTrending1NextAria}
              variant="outline"
              size="icon"
              onClick={() => scrollByCard(1)}
            />
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {CLIPS.map((clip) => (
            <article
              key={clip.id}
              className="border-border bg-surface w-52 shrink-0 snap-start overflow-hidden rounded-2xl border shadow-xs"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={placeholderImage(clip.seed, "3x4")}
                  alt=""
                  fill
                  sizes="208px"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"
                />
                <button
                  type="button"
                  className="focus-visible:ring-brand absolute inset-0 flex items-center justify-center focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="bg-bg/30 flex size-11 items-center justify-center rounded-full backdrop-blur-sm">
                    <IconPlayerPlayFilled size={18} aria-hidden="true" className="ml-0.5 text-white" />
                  </span>
                  <span className="sr-only">{smt[clip.thumbAriaKey]}</span>
                </button>
                <Badge
                  variant="secondary"
                  size="sm"
                  className="bg-bg/80 text-fg absolute top-2 right-2 backdrop-blur-sm"
                >
                  {smt[clip.durationKey]}
                </Badge>
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
                  <Avatar
                    src={placeholderImage(clip.handleKey, "1x1")}
                    alt=""
                    fallback={smt[clip.handleKey]}
                    size="xs"
                    className="ring-2 ring-white/70"
                  />
                  <span className="truncate text-xs font-medium text-white">
                    {smt[clip.handleKey]}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-fg truncate text-xs">{smt[clip.captionKey]}</p>
              </div>
              <div className="text-muted border-border flex items-center gap-3 border-t px-3 py-2 text-xs">
                <span className="flex items-center gap-1">
                  <IconHeart size={13} aria-hidden="true" />
                  {smt[clip.likesKey]}
                </span>
                <span className="flex items-center gap-1">
                  <IconMessageCircle size={13} aria-hidden="true" />
                  {smt[clip.commentsKey]}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
