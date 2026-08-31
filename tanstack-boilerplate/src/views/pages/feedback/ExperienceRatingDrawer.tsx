"use client";

import { useState } from "react";
import { IconMoodSad, IconMoodSmile, IconMoodHappy, IconMoodNeutral } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/Drawer";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeedbackMessages } from "@/types/pages/feedback/FeedbackMessages-types";

const MOODS: { value: string; icon: Icon; labelKey: string }[] = [
  { value: "poor", icon: IconMoodSad, labelKey: "feedback4MoodPoor" },
  { value: "okay", icon: IconMoodNeutral, labelKey: "feedback4MoodOkay" },
  { value: "good", icon: IconMoodSmile, labelKey: "feedback4MoodGood" },
  { value: "great", icon: IconMoodHappy, labelKey: "feedback4MoodGreat" },
];

export function ExperienceRatingDrawer() {
  const t = useMessages("pages") as unknown as PagesWithFeedbackMessages;
  const fb = t.feedback;
  const [mood, setMood] = useState<string>("");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">{fb.feedback4Trigger}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto flex w-full max-w-md flex-col gap-6">
              <DrawerHeader>
                <DrawerTitle>{fb.feedback4Heading}</DrawerTitle>
                <DrawerDescription>{fb.feedback4Description}</DrawerDescription>
              </DrawerHeader>
              <div className="flex justify-center gap-3 px-4">
                {MOODS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    data-state={mood === option.value ? "active" : "inactive"}
                    className="data-[state=active]:border-brand data-[state=active]:bg-brand/10 data-[state=active]:text-brand border-border text-muted flex flex-col items-center gap-1.5 rounded-xl border p-3"
                  >
                    <option.icon size={26} aria-hidden="true" />
                    <span className="text-xs font-medium">{fb[option.labelKey]}</span>
                  </button>
                ))}
              </div>
              <div className="px-4">
                <Textarea placeholder={fb.feedback4CommentPlaceholder} rows={3} />
              </div>
              <DrawerFooter>
                <Button variant="primary">{fb.feedback4Submit}</Button>
                <DrawerClose asChild>
                  <Button variant="ghost">{fb.feedback4Cancel}</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </section>
  );
}
