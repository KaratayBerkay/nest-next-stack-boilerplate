"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  IconBrandWindows,
  IconCheck,
  IconCopy,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;
const WINGET_COMMAND = "winget install Acme" as const;

function handleCopy(setCopied: Dispatch<SetStateAction<boolean>>) {
  navigator.clipboard.writeText(WINGET_COMMAND);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

export function CenteredWingetDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;
  const [copied, setCopied] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 text-center">
          <span className="border-border bg-surface-hover/50 text-brand flex size-16 items-center justify-center rounded-2xl border shadow-xs">
            <IconBrandWindows size={32} />
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {d.download13Title}
          </h2>
          <p className="text-muted">{d.download13Description}</p>
          <p className="text-muted text-sm">
            {d.download13Version} · {d.download13Size}
          </p>
          <Button asChild variant="primary" size="lg" className="!rounded-full">
            <a href={LINK_URL}>
              <IconDownload size={18} />
              {d.download13Download}
            </a>
          </Button>
          <div className="w-full">
            <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
              {d.download13CommandLabel}
            </p>
            <div className="border-border bg-surface flex w-full items-center justify-between gap-3 rounded-xl border p-2 pl-4 shadow-xs">
              <code className="text-fg font-mono text-sm">
                {WINGET_COMMAND}
              </code>
              <Button
                size="sm"
                variant={copied ? "soft" : "outline"}
                className="!rounded-full"
                leftIcon={
                  copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                }
                onClick={() => handleCopy(setCopied)}
                aria-live="polite"
              >
                {copied ? d.download13Copied : d.download13Copy}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
