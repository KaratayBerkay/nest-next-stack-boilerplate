"use client";

import { useState } from "react";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { Slider } from "@/components/ui/Slider";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareProductsMessages } from "@/types/pages/compare-products/CompareProductsMessages-types";

const DETAIL_ROWS = [
  {
    labelKey: "compareProducts4Row1Label",
    beforeValue: "Canvas 2D",
    afterValue: "WebGL",
  },
  {
    labelKey: "compareProducts4Row2Label",
    beforeValue: "28 fps",
    afterValue: "120 fps",
  },
  {
    labelKey: "compareProducts4Row3Label",
    beforeValue: "480 kB",
    afterValue: "96 kB",
  },
  {
    labelKey: "compareProducts4Row4Label",
    beforeValue: "3 days",
    afterValue: "15 min",
  },
  {
    labelKey: "compareProducts4Row5Label",
    beforeValue: "Partial",
    afterValue: "WCAG 2.2 AA",
  },
  {
    labelKey: "compareProducts4Row6Label",
    beforeValue: "Email only",
    afterValue: "24/7 chat",
  },
] as const;

export function ResizableBeforeAfter() {
  const [position, setPosition] = useState([50]);
  const m = useMessages("pages") as unknown as PagesWithCompareProductsMessages;
  const co = m.compareProducts;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compareProducts4Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.compareProducts4Intro}
          </Typography>
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-border relative aspect-[4/3] overflow-hidden rounded-3xl border shadow-xs md:aspect-[16/9]">
            <div
              aria-hidden="true"
              className="bg-brand/10 absolute inset-0 flex items-center justify-center"
            >
              <div className="border-brand/30 bg-brand/10 ring-border flex size-24 items-center justify-center rounded-3xl shadow-xs ring-1 ring-inset">
                <IconSparkles size={44} className="text-brand" stroke={1.5} />
              </div>
            </div>
            <div
              aria-hidden="true"
              className="bg-surface-hover absolute inset-0 flex items-center justify-center"
              style={{ clipPath: `inset(0 ${100 - position[0]}% 0 0)` }}
            >
              <div className="border-border bg-surface ring-border flex size-24 items-center justify-center rounded-3xl shadow-xs ring-1 ring-inset">
                <IconPhoto size={44} className="text-muted" stroke={1.5} />
              </div>
            </div>
            <span className="border-border bg-surface/90 absolute top-4 left-4 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
              {co.compareProducts4BeforeLabel}
            </span>
            <span className="text-brand-fg bg-brand/90 absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
              {co.compareProducts4AfterLabel}
            </span>
            <div
              aria-hidden="true"
              className="absolute inset-y-0 z-10"
              style={{ left: `${position[0]}%` }}
            >
              <div className="border-border bg-bg absolute inset-y-0 left-0 w-0.5 -translate-x-1/2 border shadow-sm" />
              <div className="border-border bg-bg absolute top-1/2 left-0 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border">
                <IconChevronLeft size={14} className="text-muted" />
                <IconChevronRight size={14} className="text-muted" />
              </div>
            </div>
          </div>
          <Slider
            value={position}
            onValueChange={setPosition}
            max={100}
            step={1}
            className="mx-auto max-w-md"
          />
        </div>
        <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-xs">
          <div className="border-border flex flex-col gap-2 border-b p-6 lg:p-8">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tight"
            >
              {co.compareProducts4ListTitle}
            </Typography>
            <Typography variant="bodySmall" className="text-muted">
              {co.compareProducts4ListIntro}
            </Typography>
          </div>
          <div className="border-border divide-border grid grid-cols-[1fr_1fr_1fr] divide-x border-b">
            <div className="px-6 py-4 lg:px-8">
              <Typography
                variant="overline"
                className="text-xs font-semibold tracking-widest"
              >
                {co.compareProducts4DetailLabel}
              </Typography>
            </div>
            <div className="px-6 py-4 lg:px-8">
              <Typography
                variant="overline"
                className="text-xs font-semibold tracking-widest"
              >
                {co.compareProducts4BeforeLabel}
              </Typography>
            </div>
            <div className="bg-brand/5 px-6 py-4 lg:px-8">
              <Typography
                variant="overline"
                className="text-brand text-xs font-semibold tracking-widest"
              >
                {co.compareProducts4AfterLabel}
              </Typography>
            </div>
          </div>
          <div className="divide-border divide-y">
            {DETAIL_ROWS.map((row) => (
              <div
                key={row.labelKey}
                className="hover:bg-surface-hover grid grid-cols-3 items-center gap-4 px-6 py-4 transition-colors lg:px-8"
              >
                <Typography variant="body" className="font-semibold">
                  {co[row.labelKey]}
                </Typography>
                <span className="text-muted flex items-center gap-2 text-sm">
                  <IconX size={15} stroke={2} className="shrink-0" />
                  {row.beforeValue}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <IconCheck
                    size={15}
                    stroke={2}
                    className="text-brand shrink-0"
                  />
                  {row.afterValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
