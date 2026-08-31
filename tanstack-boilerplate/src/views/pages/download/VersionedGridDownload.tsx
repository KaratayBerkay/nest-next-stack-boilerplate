"use client";

import {
  IconArrowRight,
  IconBrandApple,
  IconBrandChrome,
  IconBrandUbuntu,
  IconBrandWindows,
  IconDownload,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface PlatformCard {
  id: string;
  icon: Icon;
  nameKey: string;
  versionKey: string;
}

const PLATFORM_CARDS: PlatformCard[] = [
  {
    id: "windows",
    icon: IconBrandWindows,
    nameKey: "download6WindowsName",
    versionKey: "download6WindowsVersion",
  },
  {
    id: "macos",
    icon: IconBrandApple,
    nameKey: "download6MacName",
    versionKey: "download6MacVersion",
  },
  {
    id: "linux",
    icon: IconBrandUbuntu,
    nameKey: "download6LinuxName",
    versionKey: "download6LinuxVersion",
  },
  {
    id: "chromeos",
    icon: IconBrandChrome,
    nameKey: "download6ChromeName",
    versionKey: "download6ChromeVersion",
  },
];

export function VersionedGridDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline" pill>
              {d.download6VersionBadge}
            </Badge>
            <a
              href={LINK_URL}
              aria-label={d.download6ReleaseAria}
              className="text-brand flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {d.download6ReleaseLabel}
              <IconArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download6Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download6Description}
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="border-border bg-surface flex flex-col items-start gap-5 rounded-2xl border p-6 shadow-xs"
              >
                <Icon size={32} aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <span className="text-fg text-base font-semibold">
                    {d[card.nameKey]}
                  </span>
                  <span className="text-muted text-sm">
                    {d[card.versionKey]}
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="!rounded-full"
                  aria-label={d.download6DownloadAria}
                  leftIcon={<IconDownload size={16} aria-hidden="true" />}
                >
                  <a href={LINK_URL}>{d.download6Download}</a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
