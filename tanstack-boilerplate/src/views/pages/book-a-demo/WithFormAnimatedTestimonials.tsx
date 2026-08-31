"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconBrandFramer,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandVercel,
} from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type {
  BookADemo2Testimonial,
  BookADemoLogo,
  PagesWithBookADemoMessages,
} from "@/types/pages/book-a-demo/BookADemoMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const ROTATION_INTERVAL_MS = 5000 as const;

const TESTIMONIALS: BookADemo2Testimonial[] = [
  {
    quoteKey: "bookADemo2Testimonial1Quote",
    authorKey: "bookADemo2Testimonial1Author",
    roleKey: "bookADemo2Testimonial1Role",
    initialsKey: "bookADemo2Testimonial1Initials",
    avatarSeed: "bookademo2-1",
  },
  {
    quoteKey: "bookADemo2Testimonial2Quote",
    authorKey: "bookADemo2Testimonial2Author",
    roleKey: "bookADemo2Testimonial2Role",
    initialsKey: "bookADemo2Testimonial2Initials",
    avatarSeed: "bookademo2-2",
  },
  {
    quoteKey: "bookADemo2Testimonial3Quote",
    authorKey: "bookADemo2Testimonial3Author",
    roleKey: "bookADemo2Testimonial3Role",
    initialsKey: "bookADemo2Testimonial3Initials",
    avatarSeed: "bookademo2-3",
  },
];

const LOGOS: BookADemoLogo[] = [
  { icon: IconBrandVercel },
  { icon: IconBrandFramer },
  { icon: IconBrandNotion },
  { icon: IconBrandSlack },
  { icon: IconBrandStripe },
];

function handleFieldChange(
  event: ChangeEvent<HTMLInputElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setName: Dispatch<SetStateAction<string>>,
  setEmail: Dispatch<SetStateAction<string>>,
  setCompany: Dispatch<SetStateAction<string>>,
) {
  event.preventDefault();
  setName("");
  setEmail("");
  setCompany("");
}

function advanceTestimonial(
  setIndex: Dispatch<SetStateAction<number>>,
  length: number,
) {
  setIndex((current) => (current + 1) % length);
}

function goToTestimonial(
  setIndex: Dispatch<SetStateAction<number>>,
  index: number,
) {
  setIndex(index);
}

export function WithFormAnimatedTestimonials() {
  const t = useMessages("pages") as unknown as PagesWithBookADemoMessages;
  const bp = t.bookADemo;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Auto-advance pauses while hovered/focused and stops entirely for
  // reduced-motion users; the avatar buttons still switch manually.
  useEffect(() => {
    if (paused || reducedMotion) return;
    const interval = window.setInterval(
      () => advanceTestimonial(setTestimonialIndex, TESTIMONIALS.length),
      ROTATION_INTERVAL_MS,
    );
    return () => window.clearInterval(interval);
  }, [paused, reducedMotion]);

  const activeTestimonial = TESTIMONIALS[testimonialIndex];

  return (
    <section
      className="w-full py-16 lg:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AvatarGroup size="md">
            {TESTIMONIALS.map((testimonial) => (
              <Avatar
                key={testimonial.avatarSeed}
                src={placeholderImage(testimonial.avatarSeed, "1x1")}
                alt={bp[testimonial.authorKey]}
                fallback={bp[testimonial.initialsKey]}
              />
            ))}
          </AvatarGroup>
          <div className="flex max-w-2xl flex-col gap-4">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {bp.bookADemo2Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {bp.bookADemo2Description}
            </Typography>
          </div>
          <Typography variant="caption">{bp.bookADemo2SocialProof}</Typography>
        </div>

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-16">
          <form
            onSubmit={(event) =>
              handleSubmit(event, setName, setEmail, setCompany)
            }
            className="border-border bg-surface flex h-fit flex-col gap-4 rounded-2xl border p-6 lg:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo2-name"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo2FormNameLabel}
                </label>
                <Input
                  id="book-a-demo2-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => handleFieldChange(event, setName)}
                  placeholder={bp.bookADemo2FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo2-email"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo2FormEmailLabel}
                </label>
                <Input
                  id="book-a-demo2-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => handleFieldChange(event, setEmail)}
                  placeholder={bp.bookADemo2FormEmailPlaceholder}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="book-a-demo2-company"
                className="text-sm font-medium"
              >
                {bp.bookADemo2FormCompanyLabel}
              </label>
              <Input
                id="book-a-demo2-company"
                type="text"
                required
                value={company}
                onChange={(event) => handleFieldChange(event, setCompany)}
                placeholder={bp.bookADemo2FormCompanyPlaceholder}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              {bp.bookADemo2FormSubmit}
            </Button>
            <Typography variant="caption" className="text-center">
              {bp.bookADemo2FormNote}
            </Typography>
          </form>

          <div className="flex flex-col gap-6">
            <div
              key={testimonialIndex}
              className="animate-fade-in-up border-border bg-surface flex flex-1 flex-col justify-between gap-6 rounded-2xl border p-6 lg:p-8"
            >
              <Typography variant="h3" className="text-xl font-medium">
                {bp[activeTestimonial.quoteKey]}
              </Typography>
              <div className="flex items-center gap-3">
                <Avatar
                  src={placeholderImage(activeTestimonial.avatarSeed, "1x1")}
                  alt={bp[activeTestimonial.authorKey]}
                  fallback={bp[activeTestimonial.initialsKey]}
                />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {bp[activeTestimonial.authorKey]}
                  </span>
                  <Typography variant="caption">
                    {bp[activeTestimonial.roleKey]}
                  </Typography>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              {TESTIMONIALS.map((testimonial, index) => (
                <button
                  key={testimonial.avatarSeed}
                  type="button"
                  aria-label={bp.bookADemo2TestimonialDotLabel}
                  aria-current={index === testimonialIndex ? "true" : undefined}
                  onClick={() => goToTestimonial(setTestimonialIndex, index)}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    index === testimonialIndex
                      ? "bg-fg"
                      : "bg-border hover:bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border-border flex flex-col items-center gap-4 border-t pt-8">
          <Typography variant="caption">{bp.bookADemo2LogosLabel}</Typography>
          <div className="text-muted flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {LOGOS.map((logo, index) => (
              <span key={index} aria-hidden="true">
                <logo.icon size={20} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
