"use client";

import { useState } from "react";
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareProductsMessages } from "@/types/pages/compare-products/CompareProductsMessages-types";

const LINK_URL = "#" as const;

export function BeforeAfterCaptions() {
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
            {co.compareProducts6Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.compareProducts6Intro}
          </Typography>
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-border relative aspect-[4/3] overflow-hidden rounded-3xl border shadow-xs md:aspect-[16/9]">
            <div className="bg-brand/10 absolute inset-0">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="border-brand/30 bg-brand/10 ring-border flex size-24 items-center justify-center rounded-3xl shadow-xs ring-1 ring-inset">
                  <IconSparkles size={44} className="text-brand" stroke={1.5} />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-6 lg:p-8">
                <Typography
                  variant="overline"
                  className="text-brand text-xs font-semibold tracking-widest"
                >
                  {co.compareProducts6AfterCaption}
                </Typography>
                <Typography
                  variant="h4"
                  className="text-xl font-medium tracking-tight"
                >
                  {co.compareProducts6AfterBody}
                </Typography>
              </div>
            </div>
            <div
              className="bg-surface-hover absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - position[0]}% 0 0)` }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="border-border bg-surface ring-border flex size-24 items-center justify-center rounded-3xl shadow-xs ring-1 ring-inset">
                  <IconPhoto size={44} className="text-muted" stroke={1.5} />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-6 lg:p-8">
                <Typography
                  variant="overline"
                  className="text-muted text-xs font-semibold tracking-widest"
                >
                  {co.compareProducts6BeforeCaption}
                </Typography>
                <Typography
                  variant="h4"
                  className="text-muted text-xl font-medium tracking-tight"
                >
                  {co.compareProducts6BeforeBody}
                </Typography>
              </div>
            </div>
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
        <div className="flex justify-center">
          <Button asChild variant="primary">
            <a href={LINK_URL}>
              {co.compareProducts6Cta}
              <IconArrowRight size={16} />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
