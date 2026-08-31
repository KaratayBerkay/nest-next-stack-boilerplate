"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconArrowRight, IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPromoBannerMessages } from "@/types/pages/promo-banner/PromoBannerMessages-types";

const SHOP_URL = "https://example.com" as const;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function TwoToneSplitShopNowPromoBanner() {
  const t = useMessages("pages") as unknown as PagesWithPromoBannerMessages;
  const p = t.promoBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="flex w-full flex-col sm:flex-row">
        <div className="bg-brand text-brand-fg flex shrink-0 flex-col items-center justify-center gap-0.5 px-6 py-4 sm:w-56">
          <span className="text-brand-fg/80 text-[11px] font-semibold tracking-widest uppercase">
            {p.promoBanner2Eyebrow}
          </span>
          <span className="text-2xl font-bold tracking-tight">
            {p.promoBanner2Percent}
          </span>
        </div>
        <div className="bg-muted/15 flex flex-1 flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="text-fg max-w-md text-sm">
            {p.promoBanner2Description}
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg group inline-flex items-center gap-1 text-sm font-semibold"
            >
              {p.promoBanner2ShopNow}
              <IconArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <IconButton
              icon={<IconX size={16} />}
              label={p.promoBannerCloseAria}
              variant="ghost"
              size="icon-sm"
              onClick={() => dismissBanner(setVisible)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
