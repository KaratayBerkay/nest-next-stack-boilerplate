"use client";

import type { FormEvent } from "react";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

function handleNotify(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

export function ComingSoonBandFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface relative overflow-hidden rounded-xl border px-6 py-14 lg:px-12">
          <IconSparkles
            size={28}
            aria-hidden="true"
            className="text-brand/20 absolute top-8 left-8"
          />
          <IconSparkles
            size={20}
            aria-hidden="true"
            className="text-brand/20 absolute right-10 bottom-10"
          />
          <div className="relative flex flex-col items-center gap-5 text-center">
            <span className="border-border text-fg inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
              {f.feature64Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature64Heading}
            </h2>
            <p className="text-muted max-w-xl leading-relaxed">
              {f.feature64Subline}
            </p>
            <form
              onSubmit={handleNotify}
              className="flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder={f.feature64InputPlaceholder}
                className="border-border bg-bg focus-visible:ring-brand w-full flex-1 rounded-full border px-5 py-2.5 text-sm outline-none focus-visible:ring-2"
              />
              <Button type="submit" className="w-full rounded-full sm:w-auto">
                {f.feature64ButtonLabel}
                <IconArrowRight size={16} aria-hidden="true" />
              </Button>
            </form>
            <p className="text-muted text-xs">{f.feature64Hint}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
