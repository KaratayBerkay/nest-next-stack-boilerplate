"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function SoftFadeUpgradeColumnFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature218Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature218Body}</p>
            <Button asChild variant="primary" className="mt-2">
              <Link href="#">{f.feature218Button}</Link>
            </Button>
          </div>
          <div className="relative">
            <Image
              src="/img/placeholders/ph-4x5-4.webp"
              alt={f.feature218ImageAlt}
              width={480}
              height={600}
              className="aspect-[4/5] w-full rounded-xl object-cover"
            />
            <div
              aria-hidden="true"
              className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
