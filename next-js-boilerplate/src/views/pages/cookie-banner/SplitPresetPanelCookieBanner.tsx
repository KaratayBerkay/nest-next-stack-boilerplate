"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCookieBannerMessages } from "@/types/pages/cookie-banner/CookieBannerMessages-types";

const PRESETS = [
  {
    id: "accept",
    labelKey: "cookieBanner16PresetAcceptLabel",
    descKey: "cookieBanner16PresetAcceptDesc",
  },
  {
    id: "essential",
    labelKey: "cookieBanner16PresetEssentialLabel",
    descKey: "cookieBanner16PresetEssentialDesc",
  },
  {
    id: "custom",
    labelKey: "cookieBanner16PresetCustomLabel",
    descKey: "cookieBanner16PresetCustomDesc",
  },
] as const;

export function SplitPresetPanelCookieBanner() {
  const t = useMessages("pages") as unknown as PagesWithCookieBannerMessages;
  const c = t.cookieBanner;
  const [visible, setVisible] = useState(true);
  const [preset, setPreset] = useState<string>("accept");

  if (!visible) return null;

  return (
    <section className="border-border bg-surface relative flex h-[600px] w-full flex-col items-stretch justify-end overflow-hidden rounded-2xl border">
      <div className="border-border bg-bg animate-fade-in-up w-full border-t motion-reduce:animate-none">
        <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
          <div className="flex flex-col gap-1">
            <p className="text-fg text-base font-semibold">
              {c.cookieBanner16Heading}
            </p>
            <p className="text-muted text-sm">{c.cookieBanner16Body}</p>
          </div>
          <div className="border-border flex w-full flex-col gap-3 border-t pt-4 sm:w-72 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
            <RadioGroup value={preset} onValueChange={setPreset}>
              {PRESETS.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <RadioGroupItem
                    value={item.id}
                    id={`cookie-banner-16-${item.id}`}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`cookie-banner-16-${item.id}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <span className="text-fg block text-sm font-medium">
                      {c[item.labelKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {c[item.descKey]}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setVisible(false)}
            >
              {c.cookieBanner16Confirm}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
