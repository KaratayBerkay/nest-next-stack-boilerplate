"use client";

import { useState } from "react";
import { IconBug, IconBulb, IconMessage2, IconSparkles } from "@tabler/icons-react";
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
  DialogClose,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeedbackMessages } from "@/types/pages/feedback/FeedbackMessages-types";

const CATEGORIES: { value: string; icon: Icon; labelKey: string }[] = [
  { value: "bug", icon: IconBug, labelKey: "feedback7Category1" },
  { value: "feature", icon: IconBulb, labelKey: "feedback7Category2" },
  { value: "praise", icon: IconSparkles, labelKey: "feedback7Category3" },
  { value: "other", icon: IconMessage2, labelKey: "feedback7Category4" },
];

export function CategorizedFeedbackDialog() {
  const t = useMessages("pages") as unknown as PagesWithFeedbackMessages;
  const fb = t.feedback;
  const [category, setCategory] = useState("bug");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Dialog>
          <DialogTrigger variant="outline">{fb.feedback7Trigger}</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{fb.feedback7Heading}</DialogTitle>
              <DialogDescription>{fb.feedback7Description}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 px-6 pb-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    data-state={category === cat.value ? "active" : "inactive"}
                    className="data-[state=active]:border-brand data-[state=active]:bg-brand/5 data-[state=active]:text-brand border-border text-muted flex flex-col items-center gap-1.5 rounded-lg border p-3"
                  >
                    <cat.icon size={20} aria-hidden="true" />
                    <span className="text-xs font-medium">{fb[cat.labelKey]}</span>
                  </button>
                ))}
              </div>
              <Textarea placeholder={fb.feedback7DetailsPlaceholder} rows={4} />
            </div>
            <DialogFooter>
              <DialogClose variant="ghost">{fb.feedback7Cancel}</DialogClose>
              <Button variant="primary">{fb.feedback7Submit}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
