"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCheck,
  IconCircleCheck,
  IconLink,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithChangelogMessages } from "@/types/pages/changelog/ChangelogMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const SITE_URL = "https://example.com/changelog" as const;

interface ChangelogEntry {
  id: string;
  versionKey: string;
  dateKey: string;
  titleKey: string;
  excerptKey: string;
  bodyKey: string;
  highlight1Key: string;
  highlight2Key: string;
  seed: string;
}

const ENTRIES: ChangelogEntry[] = [
  {
    id: "changelog6-1",
    versionKey: "changelog6Entry1Version",
    dateKey: "changelog6Entry1Date",
    titleKey: "changelog6Entry1Title",
    excerptKey: "changelog6Entry1Excerpt",
    bodyKey: "changelog6Entry1Body",
    highlight1Key: "changelog6Entry1Highlight1",
    highlight2Key: "changelog6Entry1Highlight2",
    seed: "changelog6-1",
  },
  {
    id: "changelog6-2",
    versionKey: "changelog6Entry2Version",
    dateKey: "changelog6Entry2Date",
    titleKey: "changelog6Entry2Title",
    excerptKey: "changelog6Entry2Excerpt",
    bodyKey: "changelog6Entry2Body",
    highlight1Key: "changelog6Entry2Highlight1",
    highlight2Key: "changelog6Entry2Highlight2",
    seed: "changelog6-2",
  },
  {
    id: "changelog6-3",
    versionKey: "changelog6Entry3Version",
    dateKey: "changelog6Entry3Date",
    titleKey: "changelog6Entry3Title",
    excerptKey: "changelog6Entry3Excerpt",
    bodyKey: "changelog6Entry3Body",
    highlight1Key: "changelog6Entry3Highlight1",
    highlight2Key: "changelog6Entry3Highlight2",
    seed: "changelog6-3",
  },
  {
    id: "changelog6-4",
    versionKey: "changelog6Entry4Version",
    dateKey: "changelog6Entry4Date",
    titleKey: "changelog6Entry4Title",
    excerptKey: "changelog6Entry4Excerpt",
    bodyKey: "changelog6Entry4Body",
    highlight1Key: "changelog6Entry4Highlight1",
    highlight2Key: "changelog6Entry4Highlight2",
    seed: "changelog6-4",
  },
  {
    id: "changelog6-5",
    versionKey: "changelog6Entry5Version",
    dateKey: "changelog6Entry5Date",
    titleKey: "changelog6Entry5Title",
    excerptKey: "changelog6Entry5Excerpt",
    bodyKey: "changelog6Entry5Body",
    highlight1Key: "changelog6Entry5Highlight1",
    highlight2Key: "changelog6Entry5Highlight2",
    seed: "changelog6-5",
  },
  {
    id: "changelog6-6",
    versionKey: "changelog6Entry6Version",
    dateKey: "changelog6Entry6Date",
    titleKey: "changelog6Entry6Title",
    excerptKey: "changelog6Entry6Excerpt",
    bodyKey: "changelog6Entry6Body",
    highlight1Key: "changelog6Entry6Highlight1",
    highlight2Key: "changelog6Entry6Highlight2",
    seed: "changelog6-6",
  },
];

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

function handleToggleBookmark(
  id: string,
  setBookmarked: Dispatch<SetStateAction<Record<string, boolean>>>,
) {
  setBookmarked((current) => ({ ...current, [id]: !current[id] }));
}

export function ReleaseOverlayChangelog() {
  const t = useMessages("pages") as unknown as PagesWithChangelogMessages;
  const c = t.changelog;
  const [selectedId, setSelectedId] = useState(ENTRIES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const selected = ENTRIES.find((entry) => entry.id === selectedId) ?? ENTRIES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-fg text-3xl font-medium tracking-tight lg:text-4xl">
            {c.changelog6Heading}
          </h2>
          <p className="text-muted">{c.changelog6Intro}</p>
        </div>

        <Dialog>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ENTRIES.map((entry) => {
              const isCopied = copiedId === entry.id;
              const isBookmarked = !!bookmarked[entry.id];
              return (
                <Card key={entry.id} className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" size="sm">
                      {c[entry.versionKey]}
                    </Badge>
                    <span className="text-muted">{c[entry.dateKey]}</span>
                  </div>
                  <h3 className="text-fg text-lg font-semibold tracking-tight">
                    {c[entry.titleKey]}
                  </h3>
                  <p className="text-muted flex-1 text-sm leading-relaxed">
                    {c[entry.excerptKey]}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <DialogTrigger
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedId(entry.id)}
                      className="mr-auto"
                    >
                      {c.changelog6ViewFull}
                    </DialogTrigger>
                    <span className="relative">
                      <IconButton
                        icon={
                          isCopied ? (
                            <IconCheck size={16} className="text-success" />
                          ) : (
                            <IconLink size={16} />
                          )
                        }
                        label={c.changelog6CopyLinkAria}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCopyLink(entry.id, setCopiedId)}
                      />
                      {isCopied && (
                        <span className="text-success bg-bg border-border absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md border px-2 py-1 text-xs whitespace-nowrap shadow-md">
                          {c.changelog6CopiedLabel}
                        </span>
                      )}
                    </span>
                    <IconButton
                      icon={
                        isBookmarked ? (
                          <IconBookmarkFilled
                            size={16}
                            className="text-brand"
                          />
                        ) : (
                          <IconBookmark size={16} />
                        )
                      }
                      label={
                        isBookmarked
                          ? c.changelog6BookmarkedAria
                          : c.changelog6BookmarkAria
                      }
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        handleToggleBookmark(entry.id, setBookmarked)
                      }
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          <DialogContent size="lg" closeLabel={c.changelog6CloseLabel}>
            <DialogHeader>
              <DialogTitle>{c[selected.titleKey]}</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-5">
              <AspectRatio
                ratio={16 / 9}
                className="bg-surface relative overflow-hidden rounded-xl"
              >
                <Image
                  src={placeholderImage(selected.seed, "16x9")}
                  alt={c[selected.titleKey]}
                  fill
                  sizes="(min-width: 640px) 512px, 100vw"
                  className="object-cover"
                />
              </AspectRatio>
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline">{c[selected.versionKey]}</Badge>
                <span className="text-muted">{c[selected.dateKey]}</span>
              </div>
              <p className="text-muted leading-relaxed">
                {c[selected.bodyKey]}
              </p>
              <ul className="flex flex-col gap-2">
                <li className="flex items-start gap-2 text-sm">
                  <IconCircleCheck
                    size={16}
                    className="text-success mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{c[selected.highlight1Key]}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <IconCircleCheck
                    size={16}
                    className="text-success mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{c[selected.highlight2Key]}</span>
                </li>
              </ul>
            </DialogBody>
            <DialogFooter>
              <DialogClose variant="outline">
                {c.changelog6CloseLabel}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
