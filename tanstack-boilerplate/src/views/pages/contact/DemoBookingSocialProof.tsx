"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconCircleCheck, IconStar } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const AVATARS = [
  { name: "Alice Miller", initials: "AM", seed: "contact1-alice" },
  { name: "Noah Rivera", initials: "NR", seed: "contact1-noah" },
  { name: "Sofia Tan", initials: "ST", seed: "contact1-sofia" },
  { name: "Liam Chen", initials: "LC", seed: "contact1-liam" },
  { name: "Emma Novak", initials: "EN", seed: "contact1-emma" },
  { name: "Omar Haddad", initials: "OH", seed: "contact1-omar" },
];

const DURATIONS = ["30 min", "45 min", "60 min"];

const STAR_ICONS = [0, 1, 2, 3, 4];

function handleDurationSelect(
  index: number,
  setDurationIndex: Dispatch<SetStateAction<number>>,
) {
  setDurationIndex(index);
}

function handleBookingSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>,
) {
  event.preventDefault();
  setSubmitted(true);
  setSelectedDate(undefined);
}

export function DemoBookingSocialProof() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [durationIndex, setDurationIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
                {co.contact1Title}
              </h1>
              <p className="text-muted max-w-lg leading-relaxed">
                {co.contact1Description}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <AvatarGroup max={5}>
                {AVATARS.map((avatar) => (
                  <Avatar
                    key={avatar.seed}
                    size="md"
                    src={placeholderImage(avatar.seed, "1x1")}
                    alt={avatar.name}
                    fallback={avatar.initials}
                  />
                ))}
              </AvatarGroup>
              <div className="flex flex-col items-center sm:items-start">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="flex items-center gap-0.5">
                    {STAR_ICONS.map((star) => (
                      <IconStar
                        key={star}
                        size={14}
                        className="fill-brand text-brand"
                      />
                    ))}
                  </span>
                  {co.contact1SocialProofTitle}
                </span>
                <span className="text-muted text-sm">
                  {co.contact1SocialProofSubtitle}
                </span>
              </div>
            </div>
          </div>
          {submitted ? (
            <div className="border-border bg-surface flex flex-col items-center gap-4 rounded-3xl border p-6 text-center lg:p-10">
              <IconCircleCheck size={40} className="text-brand" />
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-medium">{co.contact1Success}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {co.contact1SuccessDescription}
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleBookingSubmit(event, setSubmitted, setSelectedDate)
              }
              className="border-border flex h-fit flex-col gap-6 rounded-3xl border p-6 lg:p-8"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact1-work-email"
                  className="text-sm font-medium"
                >
                  {co.contact1WorkEmailLabel}
                </label>
                <Input
                  id="contact1-work-email"
                  type="email"
                  name="workEmail"
                  required
                  placeholder={co.contact1WorkEmailPlaceholder}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact1-date" className="text-sm font-medium">
                  {co.contact1DateLabel}
                </label>
                <Calendar
                  id="contact1-date"
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span
                  id="contact1-duration-label"
                  className="text-sm font-medium"
                >
                  {co.contact1DurationLabel}
                </span>
                <div
                  role="group"
                  aria-labelledby="contact1-duration-label"
                  className="bg-muted/15 flex items-center gap-1 rounded-full p-1"
                >
                  {DURATIONS.map((duration, index) => (
                    <button
                      key={duration}
                      type="button"
                      aria-pressed={durationIndex === index}
                      onClick={() =>
                        handleDurationSelect(index, setDurationIndex)
                      }
                      className={
                        durationIndex === index
                          ? "bg-surface text-fg h-9 flex-1 rounded-full text-sm font-medium shadow-xs"
                          : "text-muted hover:bg-surface-hover h-9 flex-1 rounded-full text-sm font-medium transition-colors"
                      }
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                style={{ borderRadius: "var(--radius-full)" }}
              >
                {co.contact1Submit}
              </Button>
              <p className="text-muted text-center text-xs">
                {co.contact1Note}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
