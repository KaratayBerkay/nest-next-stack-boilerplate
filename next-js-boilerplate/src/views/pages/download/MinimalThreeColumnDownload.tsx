"use client";

import type { Icon } from "@tabler/icons-react";
import {
  IconBrandApple,
  IconBrandUbuntu,
  IconBrandWindows,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface DownloadOption {
  id: string;
  icon: Icon;
  nameKey: string;
  metaKey: string;
}

const OPTIONS: DownloadOption[] = [
  {
    id: "windows",
    icon: IconBrandWindows,
    nameKey: "download2WindowsName",
    metaKey: "download2WindowsMeta",
  },
  {
    id: "macos",
    icon: IconBrandApple,
    nameKey: "download2MacName",
    metaKey: "download2MacMeta",
  },
  {
    id: "linux",
    icon: IconBrandUbuntu,
    nameKey: "download2LinuxName",
    metaKey: "download2LinuxMeta",
  },
];

export function MinimalThreeColumnDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download2Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download2Description}
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="border-border bg-surface flex flex-col items-start gap-6 rounded-2xl border p-6 shadow-xs"
              >
                <div className="flex w-full items-start justify-between">
                  <Icon size={32} />
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    aria-label={d.download2DownloadLabel}
                  >
                    <a href={LINK_URL}>
                      <IconDownload size={18} />
                    </a>
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-fg text-base font-semibold">
                    {d[option.nameKey]}
                  </span>
                  <span className="text-muted text-sm">
                    {d[option.metaKey]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
