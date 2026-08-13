"use client";

import { IconCheck, IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface FeatureRow {
  id: string;
  key: string;
}

const FEATURE_ROWS: FeatureRow[] = [
  { id: "feature-1", key: "download4Feature1" },
  { id: "feature-2", key: "download4Feature2" },
  { id: "feature-3", key: "download4Feature3" },
  { id: "feature-4", key: "download4Feature4" },
];

export function SplitFeatureIconsDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid overflow-hidden rounded-3xl border shadow-xs lg:grid-cols-2">
          <div className="flex flex-col gap-6 p-8 lg:p-12">
            <h2 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
              {d.download4Heading}
            </h2>
            <p className="text-muted lg:text-lg">{d.download4Description}</p>
            <ul className="mt-2 flex flex-col gap-4">
              {FEATURE_ROWS.map((row) => (
                <li key={row.id} className="flex items-center gap-3">
                  <span className="bg-brand/10 text-brand flex size-6 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={14} aria-hidden="true" />
                  </span>
                  <span className="text-fg text-sm font-medium">
                    {d[row.key]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-hover/50 flex flex-col items-center justify-center gap-6 p-8 text-center lg:p-12">
            <span
              aria-hidden="true"
              className="border-border bg-surface text-brand flex size-20 items-center justify-center rounded-2xl border shadow-xs"
            >
              <IconDownload size={36} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-fg text-lg font-semibold">
                {d.download4AppName}
              </p>
              <p className="text-muted text-sm">{d.download4AppMeta}</p>
            </div>
            <Button
              asChild
              variant="primary"
              size="lg"
              className="!rounded-full"
              leftIcon={<IconDownload size={18} aria-hidden="true" />}
            >
              <a href={LINK_URL} aria-label={d.download4DownloadAria}>
                {d.download4Download}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
