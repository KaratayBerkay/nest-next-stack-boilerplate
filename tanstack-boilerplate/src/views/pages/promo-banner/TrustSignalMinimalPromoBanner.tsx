"use client";

import { Fragment } from "react";
import type { IconProps } from "@tabler/icons-react";
import { IconHeadset, IconLock, IconRotate, IconStarFilled } from "@tabler/icons-react";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPromoBannerMessages } from "@/types/pages/promo-banner/PromoBannerMessages-types";

interface TrustItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  labelKey: string;
}

const ITEMS: TrustItem[] = [
  { id: "secure", icon: IconLock, labelKey: "promoBanner4Item1" },
  { id: "returns", icon: IconRotate, labelKey: "promoBanner4Item2" },
  { id: "rating", icon: IconStarFilled, labelKey: "promoBanner4Item3" },
  { id: "support", icon: IconHeadset, labelKey: "promoBanner4Item4" },
];

export function TrustSignalMinimalPromoBanner() {
  const t = useMessages("pages") as unknown as PagesWithPromoBannerMessages;
  const p = t.promoBanner;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="bg-muted/10 w-full py-3">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 sm:px-6">
          {ITEMS.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && (
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
              )}
              <div className="flex items-center gap-1.5">
                <item.icon size={15} className="text-muted shrink-0" aria-hidden="true" />
                <span className="text-fg text-xs font-medium sm:text-sm">{p[item.labelKey]}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
