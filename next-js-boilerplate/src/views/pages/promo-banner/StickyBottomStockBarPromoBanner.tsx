"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { IconFlame, IconShoppingCart, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPromoBannerMessages } from "@/types/pages/promo-banner/PromoBannerMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const STOCK_LEFT = 6;
const STOCK_TOTAL = 40;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function StickyBottomStockBarPromoBanner() {
  const t = useMessages("pages") as unknown as PagesWithPromoBannerMessages;
  const p = t.promoBanner;
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const stockPercent = Math.round((STOCK_LEFT / STOCK_TOTAL) * 100);

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t px-4 py-4 motion-reduce:animate-none sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-4">
          <div className="bg-surface relative size-14 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={placeholderImage("promo-banner-7", "1x1")}
              alt={p.promoBanner7ImageAlt}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="error" size="sm" pill className="gap-1">
                <IconFlame size={12} aria-hidden="true" />
                {p.promoBanner7Badge}
              </Badge>
              <p className="text-fg truncate text-sm font-medium">
                {p.promoBanner7ProductName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={stockPercent} size="sm" className="max-w-32" />
              <span className="text-muted shrink-0 text-xs">
                {p.promoBanner7StockLabel.replace(
                  "{count}",
                  String(STOCK_LEFT),
                )}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-fg text-base font-semibold">
                {p.promoBanner7SalePrice}
              </span>
              <span className="text-muted text-xs line-through">
                {p.promoBanner7OriginalPrice}
              </span>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              rightIcon={<IconShoppingCart size={14} />}
            >
              {p.promoBanner7Cta}
            </Button>
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
