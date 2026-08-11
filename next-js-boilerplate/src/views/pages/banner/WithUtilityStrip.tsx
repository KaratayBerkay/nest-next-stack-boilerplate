"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconArrowRight, IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const LEARN_MORE_URL = "https://example.com" as const;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function WithUtilityStrip() {
  const t = useMessages("pages").banner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-start overflow-hidden rounded-2xl border">
      <div className="border-brand bg-muted/15 w-full border-t-2">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex flex-1 flex-col gap-0.5 md:items-center md:gap-1">
            <p className="text-sm font-semibold">{t.b7Title}</p>
            <p className="text-muted text-sm">
              {t.b7Message}{" "}
              <a
                href={LEARN_MORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline underline-offset-4 md:hidden"
              >
                {t.b7Link}
              </a>
            </p>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <Separator orientation="vertical" className="h-6" />
            <a
              href={LEARN_MORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg group inline-flex items-center gap-1 text-sm font-medium"
            >
              {t.b7Link}
              <IconArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>
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
