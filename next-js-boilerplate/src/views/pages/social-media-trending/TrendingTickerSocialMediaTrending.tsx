"use client";

import { useState } from "react";
import { IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSocialMediaTrendingMessages } from "@/types/pages/social-media-trending/SocialMediaTrendingMessages-types";

const TICKER_CSS = `
@keyframes smt7-ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
.animate-smt7-ticker {
  animation: smt7-ticker 28s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-smt7-ticker {
    animation: none;
  }
}
`;

interface TrendingTopic {
  id: string;
  rank: number;
  labelKey: string;
  captionKey: string;
  count: number;
}

const TOPICS: TrendingTopic[] = [
  {
    id: "smt7-topic-1",
    rank: 1,
    labelKey: "socialMediaTrending7Topic1Label",
    captionKey: "socialMediaTrending7Topic1Caption",
    count: 84300,
  },
  {
    id: "smt7-topic-2",
    rank: 2,
    labelKey: "socialMediaTrending7Topic2Label",
    captionKey: "socialMediaTrending7Topic2Caption",
    count: 51200,
  },
  {
    id: "smt7-topic-3",
    rank: 3,
    labelKey: "socialMediaTrending7Topic3Label",
    captionKey: "socialMediaTrending7Topic3Caption",
    count: 39750,
  },
  {
    id: "smt7-topic-4",
    rank: 4,
    labelKey: "socialMediaTrending7Topic4Label",
    captionKey: "socialMediaTrending7Topic4Caption",
    count: 27600,
  },
  {
    id: "smt7-topic-5",
    rank: 5,
    labelKey: "socialMediaTrending7Topic5Label",
    captionKey: "socialMediaTrending7Topic5Caption",
    count: 18900,
  },
  {
    id: "smt7-topic-6",
    rank: 6,
    labelKey: "socialMediaTrending7Topic6Label",
    captionKey: "socialMediaTrending7Topic6Caption",
    count: 12100,
  },
];

export function TrendingTickerSocialMediaTrending() {
  const m = useMessages(
    "pages",
  ) as unknown as PagesWithSocialMediaTrendingMessages;
  const smt = m.socialMediaTrending;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = TOPICS.find((topic) => topic.id === selectedId) ?? null;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="error" pill size="sm" className="w-fit gap-1.5">
              <span
                className="bg-error-fg size-1.5 animate-pulse rounded-full"
                aria-hidden="true"
              />
              {smt.socialMediaTrending7LiveLabel}
            </Badge>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {smt.socialMediaTrending7Heading}
            </h2>
            <p className="text-muted max-w-xl text-sm">
              {smt.socialMediaTrending7Subheading}
            </p>
          </div>
        </div>

        <style>{TICKER_CSS}</style>
        <div className="border-border bg-surface relative overflow-hidden rounded-2xl border py-4">
          <div className="from-surface pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r to-transparent" />
          <div className="from-surface pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l to-transparent" />
          <div className="animate-smt7-ticker flex w-max items-center gap-3 px-3">
            {[...TOPICS, ...TOPICS].map((topic, index) => (
              <button
                key={`${topic.id}-${index}`}
                type="button"
                onClick={() => setSelectedId(topic.id)}
                aria-label={smt.socialMediaTrending7SelectAria}
                className="border-border bg-bg hover:border-brand/50 flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors"
              >
                <span className="text-brand font-semibold">#{topic.rank}</span>
                <span className="text-fg font-medium">
                  {smt[topic.labelKey]}
                </span>
                <span className="text-muted flex items-center gap-1 text-xs">
                  <IconTrendingUp size={12} aria-hidden="true" />
                  {topic.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "border-border bg-surface rounded-2xl border p-5 transition-opacity",
            selected ? "opacity-100" : "opacity-70",
          )}
        >
          {selected ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-fg text-sm font-semibold">
                {smt[selected.labelKey]}
              </span>
              <p className="text-muted text-sm leading-relaxed">
                {smt[selected.captionKey]}
              </p>
            </div>
          ) : (
            <p className="text-muted text-sm">
              {smt.socialMediaTrending7EmptyHint}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
