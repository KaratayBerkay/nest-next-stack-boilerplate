"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LIST_KEYS = [
  "feature11Item1",
  "feature11Item2",
  "feature11Item3",
  "feature11Item4",
] as const;

export function DottedListSplitFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Image
            src="/img/placeholders/ph-4x3-4.webp"
            alt={f.feature11ImageAlt}
            width={640}
            height={480}
            className="border-border aspect-[4/3] w-full rounded-lg border object-cover"
          />
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature11Heading}
            </h2>
            <ul className="flex flex-col gap-3">
              {LIST_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="border-muted mt-2.5 h-0 w-3 shrink-0 border-t-2 border-dotted"
                  />
                  <span className="text-muted text-sm leading-relaxed">
                    {f[key]}
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-2">
              <Link href="#">{f.feature11Button}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
