"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const LINK_URL = "https://example.com" as const;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function WithContainerAnnouncement() {
  const t = useMessages("pages").banner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="bg-muted/15 flex w-full items-center justify-center gap-4 rounded-lg px-4 py-3">
          <p className="text-sm">
            <span className="font-semibold">{t.b2Title}</span>{" "}
            <span className="text-muted">{t.b2Description}</span>{" "}
            <a
              href={LINK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline underline-offset-4"
            >
              {t.b2Link}
            </a>
            .
          </p>
          <IconButton
            icon={<IconX size={16} />}
            label={t.bannerCloseAria}
            variant="ghost"
            size="icon-sm"
            onClick={() => dismissBanner(setVisible)}
          />
        </div>
      </div>
    </section>
  );
}
