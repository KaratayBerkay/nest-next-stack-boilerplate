"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction, UIEvent } from "react";
import {
  IconCheck,
  IconHeart,
  IconHeartFilled,
  IconLink,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChangelogMessages } from "@/types/pages/changelog/ChangelogMessages-types";

const SITE_URL = "https://example.com/changelog" as const;

interface FeedEntry {
  id: string;
  dateKey: string;
  versionKey: string;
  authorKey: string;
  titleKey: string;
  descriptionKey: string;
  baseLikes: number;
  comments: number;
}

const ENTRIES: FeedEntry[] = [
  {
    id: "changelog4-1",
    dateKey: "changelog4Entry1Date",
    versionKey: "changelog4Entry1Version",
    authorKey: "changelog4Entry1Author",
    titleKey: "changelog4Entry1Title",
    descriptionKey: "changelog4Entry1Description",
    baseLikes: 42,
    comments: 6,
  },
  {
    id: "changelog4-2",
    dateKey: "changelog4Entry2Date",
    versionKey: "changelog4Entry2Version",
    authorKey: "changelog4Entry2Author",
    titleKey: "changelog4Entry2Title",
    descriptionKey: "changelog4Entry2Description",
    baseLikes: 27,
    comments: 3,
  },
  {
    id: "changelog4-3",
    dateKey: "changelog4Entry3Date",
    versionKey: "changelog4Entry3Version",
    authorKey: "changelog4Entry3Author",
    titleKey: "changelog4Entry3Title",
    descriptionKey: "changelog4Entry3Description",
    baseLikes: 58,
    comments: 11,
  },
  {
    id: "changelog4-4",
    dateKey: "changelog4Entry4Date",
    versionKey: "changelog4Entry4Version",
    authorKey: "changelog4Entry4Author",
    titleKey: "changelog4Entry4Title",
    descriptionKey: "changelog4Entry4Description",
    baseLikes: 33,
    comments: 4,
  },
  {
    id: "changelog4-5",
    dateKey: "changelog4Entry5Date",
    versionKey: "changelog4Entry5Version",
    authorKey: "changelog4Entry5Author",
    titleKey: "changelog4Entry5Title",
    descriptionKey: "changelog4Entry5Description",
    baseLikes: 15,
    comments: 2,
  },
];

function handleScroll(
  event: UIEvent<HTMLDivElement>,
  setProgress: Dispatch<SetStateAction<number>>,
) {
  const el = event.currentTarget;
  const max = el.scrollHeight - el.clientHeight;
  setProgress(
    max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0,
  );
}

function handleToggleLike(
  id: string,
  setLiked: Dispatch<SetStateAction<Record<string, boolean>>>,
) {
  setLiked((current) => ({ ...current, [id]: !current[id] }));
}

async function handleCopyLink(
  id: string,
  setCopiedId: Dispatch<SetStateAction<string | null>>,
) {
  try {
    await navigator.clipboard.writeText(`${SITE_URL}#${id}`);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  } catch {
    setCopiedId(null);
  }
}

export function SocialFeedChangelog() {
  const t = useMessages("pages") as unknown as PagesWithChangelogMessages;
  const c = t.changelog;
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-fg text-3xl font-medium tracking-tight lg:text-4xl">
            {c.changelog4Heading}
          </h2>
          <p className="text-muted">{c.changelog4Intro}</p>
        </div>

        <div className="flex gap-4">
          <div
            className="bg-border relative w-1 shrink-0 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <div
              className="bg-brand absolute inset-x-0 top-0 w-full rounded-full transition-[height] duration-150"
              style={{ height: `${progress}%` }}
            />
          </div>

          <div
            onScroll={(event) => handleScroll(event, setProgress)}
            className="scroll-fade-y flex max-h-[32rem] flex-1 flex-col gap-8 overflow-y-auto pr-1"
          >
            {ENTRIES.map((entry) => {
              const isLiked = !!liked[entry.id];
              const likeCount = entry.baseLikes + (isLiked ? 1 : 0);
              const isCopied = copiedId === entry.id;
              return (
                <article
                  key={entry.id}
                  className="border-border flex flex-col gap-3 border-b pb-8 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" fallback={c[entry.authorKey]} />
                    <div className="flex flex-col">
                      <span className="text-fg text-sm font-medium">
                        {c[entry.authorKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {c[entry.dateKey]}
                      </span>
                    </div>
                    <Badge variant="outline" size="sm" className="ml-auto">
                      {c[entry.versionKey]}
                    </Badge>
                  </div>
                  <h3 className="text-fg text-lg font-semibold tracking-tight">
                    {c[entry.titleKey]}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {c[entry.descriptionKey]}
                  </p>
                  <div className="text-muted flex items-center gap-5 pt-1 text-sm">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(entry.id, setLiked)}
                      aria-pressed={isLiked}
                      aria-label={c.changelog4LikeAria}
                      className={cn(
                        "flex items-center gap-1.5 transition-colors",
                        isLiked ? "text-error" : "hover:text-fg",
                      )}
                    >
                      {isLiked ? (
                        <IconHeartFilled size={16} aria-hidden="true" />
                      ) : (
                        <IconHeart size={16} aria-hidden="true" />
                      )}
                      {likeCount} {c.changelog4LikesLabel}
                    </button>
                    <span className="flex items-center gap-1.5">
                      <IconMessageCircle size={16} aria-hidden="true" />
                      {entry.comments} {c.changelog4CommentsLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(entry.id, setCopiedId)}
                      aria-label={c.changelog4ShareAria}
                      className="hover:text-fg ml-auto flex items-center gap-1.5 transition-colors"
                    >
                      {isCopied ? (
                        <IconCheck
                          size={16}
                          className="text-success"
                          aria-hidden="true"
                        />
                      ) : (
                        <IconLink size={16} aria-hidden="true" />
                      )}
                      {isCopied ? c.changelog4CopiedLabel : null}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
