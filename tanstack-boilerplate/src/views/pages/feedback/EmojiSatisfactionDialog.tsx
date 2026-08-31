"use client";

import { useState } from "react";
import {
  IconMoodAngry,
  IconMoodSad,
  IconMoodNeutral,
  IconMoodSmile,
  IconMoodHappy,
  IconMessageDots,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Slider } from "@/components/ui/Slider";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeedbackMessages } from "@/types/pages/feedback/FeedbackMessages-types";

const MOODS: { icon: Icon; labelKey: string }[] = [
  { icon: IconMoodAngry, labelKey: "feedback6Mood1" },
  { icon: IconMoodSad, labelKey: "feedback6Mood2" },
  { icon: IconMoodNeutral, labelKey: "feedback6Mood3" },
  { icon: IconMoodSmile, labelKey: "feedback6Mood4" },
  { icon: IconMoodHappy, labelKey: "feedback6Mood5" },
];

export function EmojiSatisfactionDialog() {
  const t = useMessages("pages") as unknown as PagesWithFeedbackMessages;
  const fb = t.feedback;
  const [value, setValue] = useState([2]);
  const activeMood = MOODS[value[0]] ?? MOODS[2];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Dialog>
          <DialogTrigger variant="outline" className="inline-flex items-center gap-2">
            <IconMessageDots size={18} aria-hidden="true" />
            {fb.feedback6Trigger}
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{fb.feedback6Heading}</DialogTitle>
              <DialogDescription>{fb.feedback6Description}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 px-6 pb-2">
              <div className="text-brand flex flex-col items-center gap-2">
                <activeMood.icon size={48} aria-hidden="true" />
                <span className="text-fg text-sm font-medium">{fb[activeMood.labelKey]}</span>
              </div>
              <Slider
                value={value}
                onValueChange={setValue}
                min={0}
                max={4}
                step={1}
                className="w-full max-w-xs"
                aria-label={fb.feedback6SliderAria}
              />
            </div>
            <DialogFooter>
              <Button variant="primary" className="w-full">
                {fb.feedback6Submit}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
