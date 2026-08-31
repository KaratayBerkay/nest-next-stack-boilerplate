"use client";

import Link from "next/link";
import { IconArrowRight, IconWorld } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function GlobeArrowButtonFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="border-border bg-surface relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border">
            <div
              aria-hidden="true"
              className="border-border absolute size-[85%] rounded-full border border-dashed"
            />
            <div
              aria-hidden="true"
              className="border-border absolute size-[55%] rounded-full border border-dashed"
            />
            <span className="bg-brand/10 text-brand relative flex size-20 items-center justify-center rounded-full">
              <IconWorld size={36} aria-hidden="true" />
            </span>
          </div>
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature253Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature253Body}</p>
            <Button asChild variant="primary" className="group mt-2">
              <Link href="#">
                {f.feature253Button}
                <IconArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
