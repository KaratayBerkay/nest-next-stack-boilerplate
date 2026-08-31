"use client";

import { IconDownload, IconFileCode } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

export function SingleFileDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download3Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download3Description}
          </p>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="border-border bg-surface flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl border p-8 text-center shadow-xs">
            <span
              aria-hidden="true"
              className="border-border bg-surface-hover/50 text-brand flex size-16 items-center justify-center rounded-xl border"
            >
              <IconFileCode size={30} />
            </span>
            <p className="text-fg font-mono text-sm">{d.download3Filename}</p>
            <p className="text-muted text-sm">
              {d.download3Version} · {d.download3Size}
            </p>
            <Button
              asChild
              variant="primary"
              size="lg"
              className="mt-2"
              leftIcon={<IconDownload size={18} />}
            >
              <a href={LINK_URL}>{d.download3Download}</a>
            </Button>
            <p className="text-muted font-mono text-xs">
              {d.download3Checksum}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
