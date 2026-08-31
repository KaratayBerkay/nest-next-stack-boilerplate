"use client";

import Image from "next/image";
import { IconPlayerPlayFilled, IconQuote } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  useDialog,
} from "@/components/ui/dialog";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithTestimonialMessages } from "@/types/pages/testimonial/TestimonialMessages-types";

// DialogTrigger bakes in shared button padding that this codebase's plain
// string-join cn() can't reliably override for a full-bleed thumbnail, so a
// plain button driven by useDialog is used instead (see reviews' video grid).
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
      className="focus-visible:ring-brand relative block aspect-video w-full overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:outline-none"
    >
      {children}
    </button>
  );
}

export function VideoQuoteSpotlightTestimonial() {
  const t = useMessages("pages") as unknown as PagesWithTestimonialMessages;
  const tm = t.testimonial;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {tm.testimonial4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {tm.testimonial4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{tm.testimonial4Intro}</p>
        </div>

        <Dialog>
          <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <VideoThumbButton
              ariaLabel={tm.testimonial4PlayAria.replace(
                "{name}",
                tm.testimonial4Name,
              )}
            >
              <Image
                src={placeholderImage("testimonial4-video", "4x3")}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="bg-overlay/30 absolute inset-0 flex items-center justify-center">
                <span className="bg-bg/90 flex size-16 items-center justify-center rounded-full">
                  <IconPlayerPlayFilled
                    size={26}
                    aria-hidden="true"
                    className="text-fg ml-1"
                  />
                </span>
              </span>
            </VideoThumbButton>

            <div className="flex flex-col gap-5">
              <IconQuote size={32} aria-hidden="true" className="text-brand/40" />
              <p className="text-fg text-lg leading-relaxed font-medium lg:text-xl">
                {tm.testimonial4Quote}
              </p>
              <div>
                <p className="text-fg text-sm font-semibold">
                  {tm.testimonial4Name}
                </p>
                <p className="text-muted text-sm">{tm.testimonial4Role}</p>
              </div>
            </div>
          </div>

          <DialogContent size="md" closeLabel={tm.testimonial4CloseAria}>
            <DialogHeader>
              <DialogTitle>{tm.testimonial4Name}</DialogTitle>
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
                    {tm.testimonial4VideoPlaceholderLabel}
                  </span>
                </div>
              </div>
              <p className="text-fg text-sm leading-relaxed">
                {tm.testimonial4Quote}
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={initials(tm.testimonial4Name)}
                  size="sm"
                  variant="brand"
                />
                <div>
                  <p className="text-fg text-sm font-semibold">
                    {tm.testimonial4Name}
                  </p>
                  <p className="text-muted text-xs">{tm.testimonial4Role}</p>
                </div>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
