"use client";

import Image from "next/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const MATRIX_CELLS = Array.from({ length: 9 }, (_, index) => index);

export function IntegrationMatrixHeroFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature147Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature147Body}</p>
          </div>
          <div className="border-border bg-surface grid grid-cols-3 gap-3 rounded-2xl border p-6">
            {MATRIX_CELLS.map((cell) => (
              <span
                key={cell}
                className="border-border bg-bg flex aspect-square items-center justify-center rounded-lg border"
              >
                <Image
                  src="/img/placeholders/ph-1x1-2.webp"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="size-6 rounded-sm object-cover"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
