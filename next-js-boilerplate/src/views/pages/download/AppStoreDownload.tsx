"use client";

import { IconBrandApple, IconBrandGooglePlay } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;
const STORE_CARD_CLASS =
  "border-border bg-surface flex items-center gap-4 rounded-2xl border px-6 py-4 transition-colors hover:bg-surface-hover" as const;

export function AppStoreDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-muted text-xs font-semibold tracking-widest uppercase">
            {d.download1Badge}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download1Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download1Description}
          </p>
          <div className="flex flex-col gap-4 pt-6 sm:flex-row">
            <a
              href={LINK_URL}
              aria-label={d.download1AppleAria}
              className={STORE_CARD_CLASS}
            >
              <IconBrandApple size={28} />
              <span className="flex flex-col items-start">
                <span className="text-muted text-xs">
                  {d.download1ApplePrefix}
                </span>
                <span className="text-fg text-base font-semibold">
                  {d.download1AppleName}
                </span>
              </span>
            </a>
            <a
              href={LINK_URL}
              aria-label={d.download1GoogleAria}
              className={STORE_CARD_CLASS}
            >
              <IconBrandGooglePlay size={26} />
              <span className="flex flex-col items-start">
                <span className="text-muted text-xs">
                  {d.download1GooglePrefix}
                </span>
                <span className="text-fg text-base font-semibold">
                  {d.download1GoogleName}
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
