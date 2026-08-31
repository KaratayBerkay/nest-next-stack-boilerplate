"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import {
  IconBrandLinkedin,
  IconBrandX,
  IconCheck,
  IconClock,
  IconDownload,
  IconLink,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithResourceMessages } from "@/types/pages/resource/ResourceMessages-types";

const LINK_URL = "#" as const;
// Only used as clipboard payload for the copy-link demo below — never navigated to.
const SHARE_URL = "https://example.com/resource-report" as const;

async function handleCopyLink(setCopied: Dispatch<SetStateAction<boolean>>) {
  try {
    await navigator.clipboard.writeText(SHARE_URL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  } catch {
    setCopied(false);
  }
}

interface StatBadge {
  id: string;
  key: string;
}

const STATS: StatBadge[] = [
  { id: "pages", key: "resource2StatPages" },
  { id: "format", key: "resource2StatFormat" },
  { id: "updated", key: "resource2StatUpdated" },
];

export function HeroShareStatsResource() {
  const t = useMessages("pages") as unknown as PagesWithResourceMessages;
  const r = t.resource;
  const [copied, setCopied] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <Badge variant="soft">{r.resource2Eyebrow}</Badge>
        <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
          {r.resource2Title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Avatar
            src={placeholderImage("resource-2-author", "1x1")}
            alt={r.resource2AuthorName}
            fallback={r.resource2AuthorName.slice(0, 2)}
            size="sm"
          />
          <span className="text-fg text-sm font-medium">
            {r.resource2AuthorName}
          </span>
          <span aria-hidden="true" className="text-muted">
            ·
          </span>
          <span className="text-muted text-sm">{r.resource2PublishDate}</span>
          <span aria-hidden="true" className="text-muted">
            ·
          </span>
          <span className="text-muted flex items-center gap-1 text-sm">
            <IconClock size={14} aria-hidden="true" />
            {r.resource2ReadTime}
          </span>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-4xl px-6 lg:px-8">
        <div className="border-border bg-surface overflow-hidden rounded-3xl border">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={placeholderImage("resource-2-hero", "16x9")}
              alt={r.resource2HeroAlt}
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
            />
          </AspectRatio>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-6 px-6 text-center lg:px-8">
        <div className="flex flex-col gap-4">
          <p className="text-fg text-lg leading-relaxed">{r.resource2Lead}</p>
          <p className="text-muted leading-relaxed">{r.resource2Body1}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {STATS.map((stat) => (
            <Badge key={stat.id} variant="secondary" pill size="sm">
              {r[stat.key]}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-muted text-xs font-medium tracking-wide uppercase">
            {r.resource2ShareLabel}
          </span>
          <div className="flex items-center gap-2">
            <IconButton
              variant="outline"
              icon={<IconBrandX size={16} aria-hidden="true" />}
              label={r.resource2ShareXLabel}
            />
            <IconButton
              variant="outline"
              icon={<IconBrandLinkedin size={16} aria-hidden="true" />}
              label={r.resource2ShareLinkedInLabel}
            />
            <IconButton
              variant="outline"
              icon={
                copied ? (
                  <IconCheck
                    size={16}
                    className="text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <IconLink size={16} aria-hidden="true" />
                )
              }
              label={copied ? r.resource2CopiedLabel : r.resource2CopyLinkLabel}
              onClick={() => handleCopyLink(setCopied)}
            />
          </div>
        </div>

        <Button
          asChild
          variant="primary"
          size="lg"
          leftIcon={<IconDownload size={18} aria-hidden="true" />}
        >
          <a href={LINK_URL}>{r.resource2DownloadCta}</a>
        </Button>
      </div>
    </section>
  );
}
