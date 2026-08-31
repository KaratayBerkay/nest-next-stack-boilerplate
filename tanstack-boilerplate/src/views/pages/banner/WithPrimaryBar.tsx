"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function WithPrimaryBar() {
  const t = useMessages("pages").banner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="bg-brand text-brand-fg relative w-full">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-1 px-4 pt-10 pb-4 text-center md:flex-row md:gap-2 md:pt-3 md:text-left">
          <p className="text-sm font-semibold">{t.b4Title}</p>
          <p className="text-brand-fg/80 text-sm">{t.b4Description}</p>
          <IconButton
            icon={<IconX size={16} />}
            label={t.bannerCloseAria}
            size="icon-sm"
            className="text-brand-fg hover:bg-brand-fg/10 hidden md:inline-flex"
            onClick={() => dismissBanner(setVisible)}
          />
        </div>
        <IconButton
          icon={<IconX size={16} />}
          label={t.bannerCloseAria}
          size="icon-sm"
          className="text-brand-fg hover:bg-brand-fg/10 absolute top-2 right-2 md:hidden"
          onClick={() => dismissBanner(setVisible)}
        />
      </div>
    </section>
  );
}
