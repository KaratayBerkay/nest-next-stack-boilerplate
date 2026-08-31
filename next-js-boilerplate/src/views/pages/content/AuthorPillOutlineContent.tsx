"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconBrandLinkedin,
  IconBrandX,
  IconCopy,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Quote, Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContentMessages } from "@/types/pages/content/ContentMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const FIGURE_SEED = "content4-figure-1";

const SECTIONS: {
  id: string;
  labelKey: string;
  headingKey: string;
  paragraphKey: string;
  quoteKey?: string;
  figureAltKey?: string;
}[] = [
  {
    id: "why",
    labelKey: "content4Pill1Label",
    headingKey: "content4Section1Heading",
    paragraphKey: "content4Section1Paragraph",
  },
  {
    id: "how",
    labelKey: "content4Pill2Label",
    headingKey: "content4Section2Heading",
    paragraphKey: "content4Section2Paragraph",
    quoteKey: "content4Section2Quote",
    figureAltKey: "content4Section2FigureAlt",
  },
  {
    id: "tradeoffs",
    labelKey: "content4Pill3Label",
    headingKey: "content4Section3Heading",
    paragraphKey: "content4Section3Paragraph",
  },
  {
    id: "next",
    labelKey: "content4Pill4Label",
    headingKey: "content4Section4Heading",
    paragraphKey: "content4Section4Paragraph",
  },
];

const SHARE_ACTIONS: { icon: Icon; ariaKey: string }[] = [
  { icon: IconBrandX, ariaKey: "content4ShareXAria" },
  { icon: IconBrandLinkedin, ariaKey: "content4ShareLinkedinAria" },
  { icon: IconCopy, ariaKey: "content4ShareCopyAria" },
];

const TAGS = [
  "content4Tag1",
  "content4Tag2",
  "content4Tag3",
  "content4Tag4",
] as const;

export function AuthorPillOutlineContent() {
  const t = useMessages("pages") as unknown as PagesWithContentMessages;
  const c = t.content;
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const activeSection =
    SECTIONS.find((section) => section.id === activeId) ?? SECTIONS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar fallback={c.content4AuthorName.slice(0, 2)} size="md" />
            <div className="flex flex-col gap-0.5">
              <span className="text-fg text-sm font-medium">
                {c.content4AuthorName}
              </span>
              <div className="text-muted flex items-center gap-1.5 text-xs">
                <span>{c.content4AuthorRole}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{c.content4Date}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{c.content4ReadTime}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {SHARE_ACTIONS.map((action) => (
              <button
                key={action.ariaKey}
                type="button"
                aria-label={c[action.ariaKey]}
                className="border-border bg-surface text-muted hover:bg-surface-hover hover:text-fg focus-visible:ring-brand flex size-9 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <action.icon size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {c.content4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {c.content4Subtext}
          </Typography>
        </div>

        <div
          role="group"
          aria-label={c.content4OutlineAria}
          className="border-border flex flex-wrap gap-2 border-y py-3"
        >
          {SECTIONS.map((section) => {
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveId(section.id)}
                className={cn(
                  "focus-visible:ring-brand rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isActive
                    ? "bg-brand text-brand-fg"
                    : "text-muted hover:text-fg hover:bg-surface-hover",
                )}
              >
                {c[section.labelKey]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-5">
          <Typography
            variant="h3"
            className="text-2xl font-medium tracking-tight"
          >
            {c[activeSection.headingKey]}
          </Typography>
          <Typography variant="body" className="text-muted">
            {c[activeSection.paragraphKey]}
          </Typography>

          {activeSection.quoteKey && (
            <Quote className="text-fg">{c[activeSection.quoteKey]}</Quote>
          )}

          {activeSection.figureAltKey && (
            <AspectRatio
              ratio={3 / 2}
              className="bg-surface relative overflow-hidden rounded-2xl"
            >
              <Image
                src={placeholderImage(FIGURE_SEED, "3x2")}
                alt={c[activeSection.figureAltKey]}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </AspectRatio>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {TAGS.map((tagKey) => (
            <Badge key={tagKey} variant="soft" size="sm">
              {c[tagKey]}
            </Badge>
          ))}
        </div>

        <div className="border-border bg-surface flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
          <span className="text-sm font-medium">{c.content4FeedbackLabel}</span>
          {feedback ? (
            <span className="text-muted text-sm">
              {c.content4FeedbackThanks}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={c.content4FeedbackYesAria}
                aria-pressed={feedback === "up"}
                onClick={() => setFeedback("up")}
                className="border-border hover:bg-surface-hover text-muted hover:text-fg focus-visible:ring-brand flex size-9 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <IconThumbUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={c.content4FeedbackNoAria}
                aria-pressed={feedback === "down"}
                onClick={() => setFeedback("down")}
                className="border-border hover:bg-surface-hover text-muted hover:text-fg focus-visible:ring-brand flex size-9 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <IconThumbDown size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
