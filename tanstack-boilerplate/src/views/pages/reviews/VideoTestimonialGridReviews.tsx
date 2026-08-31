"use client";

import Image from "next/image";
import { IconPlayerPlayFilled, IconStar, IconStarFilled } from "@tabler/icons-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  useDialog,
} from "@/components/ui/dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithReviewsMessages } from "@/types/pages/reviews/ReviewsMessages-types";

interface VideoReview {
  id: string;
  rating: number;
  seed: string;
  nameKey: string;
  roleKey: string;
  quoteKey: string;
}

const VIDEOS: VideoReview[] = [
  {
    id: "video-1",
    rating: 5,
    seed: "reviews6-video-1",
    nameKey: "reviews6Video1Name",
    roleKey: "reviews6Video1Role",
    quoteKey: "reviews6Video1Quote",
  },
  {
    id: "video-2",
    rating: 5,
    seed: "reviews6-video-2",
    nameKey: "reviews6Video2Name",
    roleKey: "reviews6Video2Role",
    quoteKey: "reviews6Video2Quote",
  },
  {
    id: "video-3",
    rating: 4,
    seed: "reviews6-video-3",
    nameKey: "reviews6Video3Name",
    roleKey: "reviews6Video3Role",
    quoteKey: "reviews6Video3Quote",
  },
  {
    id: "video-4",
    rating: 5,
    seed: "reviews6-video-4",
    nameKey: "reviews6Video4Name",
    roleKey: "reviews6Video4Role",
    quoteKey: "reviews6Video4Quote",
  },
  {
    id: "video-5",
    rating: 5,
    seed: "reviews6-video-5",
    nameKey: "reviews6Video5Name",
    roleKey: "reviews6Video5Role",
    quoteKey: "reviews6Video5Quote",
  },
  {
    id: "video-6",
    rating: 4,
    seed: "reviews6-video-6",
    nameKey: "reviews6Video6Name",
    roleKey: "reviews6Video6Role",
    quoteKey: "reviews6Video6Quote",
  },
];

// DialogTrigger renders as a real <button> with the shared button size/
// padding classes baked in — this codebase's cn() is a plain string join
// (no tailwind-merge), so a className here cannot reliably strip that
// padding for a full-bleed thumbnail. A plain button driven by useDialog
// sidesteps that entirely.
function VideoThumbButton({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const { onOpenChange } = useDialog();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onOpenChange(true)}
      className="focus-visible:ring-brand relative block aspect-video w-full overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      {children}
    </button>
  );
}

export function VideoTestimonialGridReviews() {
  const t = useMessages("pages") as unknown as PagesWithReviewsMessages;
  const rv = t.reviews;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {rv.reviews6Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {rv.reviews6Heading}
          </h2>
          <p className="text-muted leading-relaxed">{rv.reviews6Intro}</p>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={rv.reviews6GridAria}
        >
          {VIDEOS.map((video) => (
            <Dialog key={video.id}>
              <div role="listitem" className="flex flex-col gap-3">
                <VideoThumbButton
                  ariaLabel={rv.reviews6PlayAriaTemplate.replace(
                    "{name}",
                    rv[video.nameKey],
                  )}
                >
                  <Image
                    src={placeholderImage(video.seed, "16x9")}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <span className="bg-overlay/30 absolute inset-0 flex items-center justify-center">
                    <span className="bg-bg/90 flex size-12 items-center justify-center rounded-full">
                      <IconPlayerPlayFilled
                        size={20}
                        aria-hidden="true"
                        className="text-fg ml-0.5"
                      />
                    </span>
                  </span>
                </VideoThumbButton>
                <div>
                  <p className="text-fg text-sm font-semibold">
                    {rv[video.nameKey]}
                  </p>
                  <p className="text-muted text-xs">{rv[video.roleKey]}</p>
                  <div
                    className="mt-1 flex items-center gap-0.5"
                    role="img"
                    aria-label={rv.reviews6RatingAriaTemplate
                      .replace("{name}", rv[video.nameKey])
                      .replace("{rating}", String(video.rating))}
                  >
                    {[1, 2, 3, 4, 5].map((n) =>
                      n <= video.rating ? (
                        <IconStarFilled
                          key={n}
                          size={13}
                          aria-hidden="true"
                          className="text-warning"
                        />
                      ) : (
                        <IconStar
                          key={n}
                          size={13}
                          aria-hidden="true"
                          className="text-border"
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
              <DialogContent size="md" closeLabel={rv.reviews6CloseAria}>
                <DialogHeader>
                  <DialogTitle>{rv[video.nameKey]}</DialogTitle>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                  <div className="bg-surface flex aspect-video w-full items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                      <span className="bg-bg flex size-14 items-center justify-center rounded-full">
                        <IconPlayerPlayFilled
                          size={22}
                          aria-hidden="true"
                          className="text-fg ml-0.5"
                        />
                      </span>
                      <span className="text-muted text-xs">
                        {rv.reviews6VideoPlaceholderLabel}
                      </span>
                    </div>
                  </div>
                  <p className="text-fg text-sm leading-relaxed">
                    {rv[video.quoteKey]}
                  </p>
                </DialogBody>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}
