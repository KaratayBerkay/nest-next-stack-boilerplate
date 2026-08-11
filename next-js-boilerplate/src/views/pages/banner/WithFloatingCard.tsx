"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconX } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const GET_STARTED_URL = "https://example.com" as const;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function WithFloatingCard() {
  const t = useMessages("pages").banner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-start justify-center overflow-hidden rounded-2xl border p-6">
      <div className="animate-fade-in border-border bg-surface relative mt-8 flex w-full max-w-3xl flex-col gap-4 rounded-2xl border p-6 shadow-lg md:flex-row md:items-center md:justify-between md:gap-6 md:p-8">
        <div className="flex flex-col gap-1 pr-8 md:pr-0">
          <p className="text-lg font-semibold">{t.b5Title}</p>
          <p className="text-muted text-sm">{t.b5Description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={GET_STARTED_URL} target="_blank" rel="noopener noreferrer">
              {t.b5Button}
            </a>
          </Button>
          <IconButton
            icon={<IconX size={16} />}
            label={t.bannerCloseAria}
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={() => dismissBanner(setVisible)}
          />
        </div>
        <IconButton
          icon={<IconX size={16} />}
          label={t.bannerCloseAria}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 md:hidden"
          onClick={() => dismissBanner(setVisible)}
        />
      </div>
    </section>
  );
}
