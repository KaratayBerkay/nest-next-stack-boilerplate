"use client";

import type { FormEvent } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

function handleSubscribe(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

export function SubscribeSparklesFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="relative w-full overflow-hidden py-24 lg:py-32">
      <IconSparkles
        size={32}
        aria-hidden="true"
        className="text-brand/20 absolute top-16 left-[12%]"
      />
      <IconSparkles
        size={24}
        aria-hidden="true"
        className="text-brand/20 absolute right-[14%] bottom-20"
      />
      <IconSparkles
        size={20}
        aria-hidden="true"
        className="text-brand/20 absolute top-1/2 right-[8%]"
      />
      <div className="relative flex flex-col items-center gap-6 px-6 text-center lg:px-8">
        <span className="border-border text-fg inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
          {f.feature293Badge}
        </span>
        <h2 className="text-fg max-w-2xl text-4xl font-semibold tracking-tight lg:text-5xl">
          {f.feature293Heading}
        </h2>
        <p className="text-muted max-w-xl leading-relaxed">
          {f.feature293Subline}
        </p>
        <form
          onSubmit={handleSubscribe}
          className="flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder={f.feature293InputPlaceholder}
            className="border-border bg-bg focus-visible:ring-brand w-full flex-1 rounded-full border px-5 py-2.5 text-sm outline-none focus-visible:ring-2"
          />
          <Button type="submit" className="w-full rounded-full sm:w-auto">
            {f.feature293ButtonLabel}
          </Button>
        </form>
        <p className="text-muted text-xs">{f.feature293Hint}</p>
      </div>
    </section>
  );
}
