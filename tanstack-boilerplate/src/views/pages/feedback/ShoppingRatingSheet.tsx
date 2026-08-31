"use client";

import { useState } from "react";
import { IconPackage, IconStar, IconStarFilled } from "@tabler/icons-react";
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
  { value: 1, ariaKey: "feedback5Star1Aria" },
  { value: 2, ariaKey: "feedback5Star2Aria" },
  { value: 3, ariaKey: "feedback5Star3Aria" },
  { value: 4, ariaKey: "feedback5Star4Aria" },
  { value: 5, ariaKey: "feedback5Star5Aria" },
] as const;

const CHIP_KEYS = ["feedback5Chip1", "feedback5Chip2", "feedback5Chip3"] as const;

export function ShoppingRatingSheet() {
  const t = useMessages("pages") as unknown as PagesWithFeedbackMessages;
  const fb = t.feedback;
  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  function toggleChip(key: string) {
    setSelectedChips((current) =>
      current.includes(key) ? current.filter((c) => c !== key) : [...current, key],
    );
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              leftIcon={<IconPackage size={18} aria-hidden="true" />}
            >
              {fb.feedback5Trigger}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-6">
            <SheetHeader className="text-left">
              <SheetTitle>{fb.feedback5Heading}</SheetTitle>
              <SheetDescription>{fb.feedback5OrderRef}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {STARS.map((star) => (
                  <button
                    key={star.value}
                    type="button"
                    onClick={() => setRating(star.value)}
                    aria-label={fb[star.ariaKey]}
                    className="text-brand p-1"
                  >
                    {star.value <= rating ? (
                      <IconStarFilled size={28} aria-hidden="true" />
                    ) : (
                      <IconStar size={28} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHIP_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleChip(key)}
                  data-state={selectedChips.includes(key) ? "active" : "inactive"}
                  className="data-[state=active]:bg-brand data-[state=active]:text-brand-fg data-[state=inactive]:bg-surface data-[state=inactive]:text-muted rounded-full px-3.5 py-1.5 text-sm transition-colors"
                >
                  {fb[key]}
                </button>
              ))}
            </div>
            <Textarea placeholder={fb.feedback5CommentPlaceholder} rows={3} />
            <SheetFooter>
              <Button variant="primary" className="w-full">
                {fb.feedback5Submit}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
