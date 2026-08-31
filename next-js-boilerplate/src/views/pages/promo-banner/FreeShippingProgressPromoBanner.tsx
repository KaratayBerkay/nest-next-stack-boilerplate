"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  IconCheck,
  IconShoppingCart,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPromoBannerMessages } from "@/types/pages/promo-banner/PromoBannerMessages-types";

const FREE_SHIPPING_THRESHOLD = 75;
const INITIAL_CART_VALUE = 35;
const ADD_AMOUNT = 20;

function dismissBanner(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function FreeShippingProgressPromoBanner() {
  const t = useMessages("pages") as unknown as PagesWithPromoBannerMessages;
  const p = t.promoBanner;
  const [visible, setVisible] = useState(true);
  const [cartValue, setCartValue] = useState<number>(INITIAL_CART_VALUE);

  if (!visible) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartValue);
  const percent = Math.round((cartValue / FREE_SHIPPING_THRESHOLD) * 100);
  const unlocked = remaining <= 0;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch overflow-hidden rounded-2xl border">
      <div className="border-border bg-surface flex w-full flex-col gap-2 border-b px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {unlocked ? (
              <IconCheck
                size={18}
                className="text-success shrink-0"
                aria-hidden="true"
              />
            ) : (
              <IconTruck
                size={18}
                className="text-brand shrink-0"
                aria-hidden="true"
              />
            )}
            <p className="text-fg truncate text-sm font-medium">
              {unlocked
                ? p.promoBanner1Unlocked
                : p.promoBanner1Message.replace("{amount}", `$${remaining}`)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {unlocked ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setCartValue(INITIAL_CART_VALUE)}
              >
                {p.promoBanner1ResetButton}
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="xs"
                leftIcon={<IconShoppingCart size={14} />}
                onClick={() =>
                  setCartValue((value) =>
                    Math.min(FREE_SHIPPING_THRESHOLD, value + ADD_AMOUNT),
                  )
                }
              >
                {p.promoBanner1AddButton}
              </Button>
            )}
            <IconButton
              icon={<IconX size={16} />}
              label={p.promoBannerCloseAria}
              variant="ghost"
              size="icon-sm"
              onClick={() => dismissBanner(setVisible)}
            />
          </div>
        </div>
        <div className="mx-auto w-full max-w-3xl">
          <Progress value={percent} size="sm" />
        </div>
      </div>
    </section>
  );
}
