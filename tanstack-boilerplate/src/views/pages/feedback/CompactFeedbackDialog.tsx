"use client";

import { useState } from "react";
import { IconMessageCircle, IconStar, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeedbackMessages } from "@/types/pages/feedback/FeedbackMessages-types";

const STARS = [
  { value: 1, ariaKey: "feedback3Star1Aria" },
  { value: 2, ariaKey: "feedback3Star2Aria" },
  { value: 3, ariaKey: "feedback3Star3Aria" },
  { value: 4, ariaKey: "feedback3Star4Aria" },
  { value: 5, ariaKey: "feedback3Star5Aria" },
] as const;

export function CompactFeedbackDialog() {
  const t = useMessages("pages") as unknown as PagesWithFeedbackMessages;
  const fb = t.feedback;
  const [rating, setRating] = useState(0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Dialog>
          <DialogTrigger variant="outline" className="inline-flex items-center gap-2">
            <IconMessageCircle size={18} aria-hidden="true" />
            {fb.feedback3Trigger}
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{fb.feedback3Heading}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 px-6 pb-2">
              <div className="flex justify-center gap-1">
                {STARS.map((star) => (
                  <button
                    key={star.value}
                    type="button"
                    onClick={() => setRating(star.value)}
                    aria-label={fb[star.ariaKey]}
                    className="text-brand p-1"
                  >
                    {star.value <= rating ? (
                      <IconStarFilled size={22} aria-hidden="true" />
                    ) : (
                      <IconStar size={22} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
              <Input placeholder={fb.feedback3InputPlaceholder} />
            </div>
            <DialogFooter>
              <DialogClose variant="ghost">{fb.feedback3Cancel}</DialogClose>
              <Button variant="primary">{fb.feedback3Submit}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
