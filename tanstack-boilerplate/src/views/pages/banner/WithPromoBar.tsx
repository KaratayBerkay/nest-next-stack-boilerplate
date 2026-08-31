"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconShoppingBag, IconX } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const PROMO_URL = "https://example.com" as const;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function WithPromoBar() {
  const t = useMessages("pages").banner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="bg-brand text-brand-fg relative w-full">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 pt-10 pb-3 text-center md:flex-row md:pt-3 md:text-left">
          <div className="flex flex-col items-center gap-0.5 md:items-start">
            <p className="text-sm font-semibold">{t.b3Title}</p>
            <p className="text-brand-fg/80 text-sm">{t.b3Description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <a href={PROMO_URL} target="_blank" rel="noopener noreferrer">
                {t.b3Button}
                <IconShoppingBag size={16} />
              </a>
            </Button>
            <IconButton
              icon={<IconX size={16} />}
              label={t.bannerCloseAria}
              size="icon-sm"
              className="text-brand-fg hover:bg-brand-fg/10 hidden md:inline-flex"
              onClick={() => dismissBanner(setVisible)}
            />
          </div>
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
