"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconX } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function WithPillSocialProof() {
  const t = useMessages("pages").banner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full items-start justify-center overflow-hidden rounded-2xl border p-6">
      <div className="animate-fade-in border-border bg-surface mt-8 flex w-full max-w-xl flex-wrap items-center justify-center gap-3 rounded-full border py-3 pr-3 pl-4 shadow-lg">
        <div className="flex shrink-0">
          <Avatar size="sm" fallback="AL" className="ring-surface ring-2" />
          <Avatar
            size="sm"
            fallback="MK"
            className="ring-surface -ml-2 ring-2"
          />
          <Avatar
            size="sm"
            fallback="SR"
            className="ring-surface -ml-2 ring-2"
          />
          <Avatar
            size="sm"
            fallback="JP"
            className="ring-surface -ml-2 ring-2"
          />
          <Avatar
            size="sm"
            fallback="TW"
            className="ring-surface -ml-2 ring-2"
          />
        </div>
        <p className="text-sm font-medium">{t.b6Text}</p>
        <IconButton
          icon={<IconX size={16} />}
          label={t.bannerCloseAria}
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={() => dismissBanner(setVisible)}
        />
      </div>
    </section>
  );
}
