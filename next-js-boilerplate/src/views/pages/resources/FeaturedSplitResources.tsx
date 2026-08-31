"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconBookmark,
  IconBookmarkFilled,
  IconCalendar,
  IconClockHour4,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithResourcesMessages } from "@/types/pages/resources/ResourcesMessages-types";

const LINK_URL = "#" as const;

interface ListItem {
  id: string;
  titleKey: string;
  typeKey: string;
  metaKey: string;
}

const LIST_ITEMS: ListItem[] = [
  {
    id: "async-standups",
    titleKey: "resources3Item1Title",
    typeKey: "resources3Item1Type",
    metaKey: "resources3Item1Meta",
  },
  {
    id: "interviewing-seniors",
    titleKey: "resources3Item2Title",
    typeKey: "resources3Item2Type",
    metaKey: "resources3Item2Meta",
  },
  {
    id: "vector-ci",
    titleKey: "resources3Item3Title",
    typeKey: "resources3Item3Type",
    metaKey: "resources3Item3Meta",
  },
  {
    id: "oncall-rotation",
    titleKey: "resources3Item4Title",
    typeKey: "resources3Item4Type",
    metaKey: "resources3Item4Meta",
  },
  {
    id: "remote-rituals",
    titleKey: "resources3Item5Title",
    typeKey: "resources3Item5Type",
    metaKey: "resources3Item5Meta",
  },
];

function handleToggleSaved(
  id: string,
  setSaved: Dispatch<SetStateAction<Set<string>>>,
) {
  setSaved((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
}

export function FeaturedSplitResources() {
  const t = useMessages("pages") as unknown as PagesWithResourcesMessages;
  const r = t.resources;
  const [saved, setSaved] = useState<Set<string>>(new Set());

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          <article className="flex flex-col gap-6">
            <div className="border-border bg-surface overflow-hidden rounded-3xl border">
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={placeholderImage("resources-3-featured", "16x9")}
                  alt={r.resources3FeaturedImageAlt}
                  fill
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover"
                />
              </AspectRatio>
            </div>
            <div className="flex flex-col gap-4">
              <Badge variant="soft" className="w-fit">
                {r.resources3FeaturedBadge}
              </Badge>
              <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
                {r.resources3FeaturedTitle}
              </h2>
              <p className="text-muted leading-relaxed">
                {r.resources3FeaturedDescription}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Avatar
                  src={placeholderImage("resources-3-author", "1x1")}
                  alt={r.resources3FeaturedAuthorName}
                  fallback={r.resources3FeaturedAuthorName.slice(0, 2)}
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className="text-fg text-sm font-medium">
                    {r.resources3FeaturedAuthorName}
                  </span>
                  <span className="text-muted text-xs">
                    {r.resources3FeaturedAuthorRole}
                  </span>
                </div>
                <span aria-hidden="true" className="text-muted">
                  ·
                </span>
                <span className="text-muted flex items-center gap-1 text-sm">
                  <IconCalendar size={14} aria-hidden="true" />
                  {r.resources3FeaturedDate}
                </span>
                <span aria-hidden="true" className="text-muted">
                  ·
                </span>
                <span className="text-muted flex items-center gap-1 text-sm">
                  <IconClockHour4 size={14} aria-hidden="true" />
                  {r.resources3FeaturedReadTime}
                </span>
              </div>
              <Button
                asChild
                variant="primary"
                className="w-fit"
                rightIcon={<IconArrowRight size={16} aria-hidden="true" />}
              >
                <a href={LINK_URL}>{r.resources3FeaturedCta}</a>
              </Button>
            </div>
          </article>

          <aside className="flex flex-col gap-4">
            <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
              {r.resources3ListHeading}
            </h3>
            <ol className="border-border divide-border flex flex-col divide-y rounded-2xl border">
              {LIST_ITEMS.map((item, index) => {
                const isSaved = saved.has(item.id);
                const title = r[item.titleKey];
                return (
                  <li key={item.id} className="flex items-center gap-3 p-4">
                    <span
                      aria-hidden="true"
                      className="text-muted w-5 shrink-0 text-sm font-medium tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={LINK_URL}
                      className="group flex min-w-0 flex-1 flex-col gap-0.5"
                    >
                      <span className="text-fg group-hover:text-brand truncate text-sm font-medium transition-colors">
                        {title}
                      </span>
                      <span className="text-muted text-xs">
                        {r[item.typeKey]} · {r[item.metaKey]}
                      </span>
                    </Link>
                    <IconButton
                      variant="ghost"
                      size="icon-sm"
                      icon={
                        isSaved ? (
                          <IconBookmarkFilled
                            size={15}
                            className="text-brand"
                            aria-hidden="true"
                          />
                        ) : (
                          <IconBookmark size={15} aria-hidden="true" />
                        )
                      }
                      label={(isSaved
                        ? r.resources3SavedAria
                        : r.resources3SaveAria
                      ).replace("{title}", title)}
                      onClick={() => handleToggleSaved(item.id, setSaved)}
                    />
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}
