"use client";

import { IconBrandWindows, IconDownload } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;
const PREVIEW_IMAGE = "/img/placeholders/ph-3x2-2.webp" as const;

export function WindowsPreviewFrameDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download11Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download11Description}
          </p>
        </div>
        <div className="border-border bg-surface mt-12 overflow-hidden rounded-2xl border shadow-xs">
          <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="border-border bg-surface-hover/50 text-brand flex size-10 items-center justify-center rounded-xl border">
                <IconBrandWindows size={22} />
              </span>
              <span className="flex flex-col items-start">
                <span className="text-fg text-sm font-semibold">
                  {d.download11Platform}
                </span>
                <span className="text-muted text-xs">
                  {d.download11Version}
                </span>
              </span>
            </div>
            <Button
              asChild
              variant="primary"
              size="md"
              className="!rounded-full"
            >
              <a href={LINK_URL}>
                <IconDownload size={16} />
                {d.download11Download}
              </a>
            </Button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="border-border bg-surface-hover overflow-hidden rounded-lg border">
              <div className="border-border flex items-center gap-2 border-b px-4 py-2.5">
                <span
                  aria-hidden="true"
                  className="bg-error size-2.5 rounded-full"
                />
                <span
                  aria-hidden="true"
                  className="bg-warning size-2.5 rounded-full"
                />
                <span
                  aria-hidden="true"
                  className="bg-success size-2.5 rounded-full"
                />
                <span className="border-border bg-surface text-muted ml-2 flex min-w-0 flex-1 items-center justify-center truncate rounded-md border px-3 py-1 font-mono text-xs">
                  {d.download11AddressBar}
                </span>
              </div>
              <Image
                src={PREVIEW_IMAGE}
                alt={d.download11PreviewAlt}
                width={800}
                height={500}
                className="h-56 w-full object-cover sm:h-72"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
