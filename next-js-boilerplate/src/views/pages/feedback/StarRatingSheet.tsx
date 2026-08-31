"use client";

import { useState } from "react";
import { IconMessageStar, IconStar, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeedbackMessages } from "@/types/pages/feedback/FeedbackMessages-types";

const STARS = [
  { value: 1, ariaKey: "feedback1Star1Aria" },
  { value: 2, ariaKey: "feedback1Star2Aria" },
  { value: 3, ariaKey: "feedback1Star3Aria" },
  { value: 4, ariaKey: "feedback1Star4Aria" },
  { value: 5, ariaKey: "feedback1Star5Aria" },
] as const;

export function StarRatingSheet() {
  const t = useMessages("pages") as unknown as PagesWithFeedbackMessages;
  const fb = t.feedback;
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              leftIcon={<IconMessageStar size={18} aria-hidden="true" />}
            >
              {fb.feedback1Trigger}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-6">
            <SheetHeader className="text-left">
              <SheetTitle>{fb.feedback1Heading}</SheetTitle>
              <SheetDescription>{fb.feedback1Description}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col items-center gap-2">
              <div
                role="radiogroup"
                aria-label={fb.feedback1RatingAria}
                className="flex gap-1"
              >
                {STARS.map((star) => {
                  const filled = star.value <= (hovered || rating);
                  return (
                    <button
                      key={star.value}
                      type="button"
                      role="radio"
                      aria-checked={star.value === rating}
                      aria-label={fb[star.ariaKey]}
                      onClick={() => setRating(star.value)}
                      onMouseEnter={() => setHovered(star.value)}
                      onMouseLeave={() => setHovered(0)}
                      className="text-brand p-1"
                    >
                      {filled ? (
                        <IconStarFilled size={28} aria-hidden="true" />
                      ) : (
                        <IconStar size={28} aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="text-muted text-xs">
                {fb.feedback1RatingHint}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="feedback1-comment"
                className="text-fg text-sm font-medium"
              >
                {fb.feedback1CommentLabel}
              </label>
              <Textarea
                id="feedback1-comment"
                placeholder={fb.feedback1CommentPlaceholder}
                rows={4}
              />
            </div>
            <SheetFooter>
              <Button variant="primary" className="w-full">
                {fb.feedback1Submit}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
