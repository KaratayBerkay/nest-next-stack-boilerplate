"use client";

import {
  IconBrandAppstore,
  IconBrandApple,
  IconBrandWindows,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

export function CenteredWindowsLinksDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download15Title}
          </h2>
          <p className="text-muted lg:text-lg">{d.download15Description}</p>
          <div className="mt-4 flex flex-col items-center gap-5">
            <span className="border-border bg-surface-hover/50 text-brand flex size-20 items-center justify-center rounded-2xl border shadow-xs">
              <IconBrandWindows size={40} />
            </span>
            <Button
              asChild
              variant="primary"
              size="lg"
              className="!rounded-full"
            >
              <a href={LINK_URL}>
                <IconDownload size={18} />
                {d.download15WindowsDownload}
              </a>
            </Button>
            <p className="text-muted text-sm">{d.download15WindowsNote}</p>
            <div className="border-border bg-surface mt-4 flex flex-col gap-3 rounded-2xl border p-4 shadow-xs sm:flex-row">
              <Button
                asChild
                variant="outline"
                size="md"
                className="!rounded-full"
              >
                <a href={LINK_URL}>
                  <IconBrandApple size={18} />
                  {d.download15MacDownload}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="md"
                className="!rounded-full"
              >
                <a href={LINK_URL}>
                  <IconBrandAppstore size={18} />
                  {d.download15IosDownload}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
