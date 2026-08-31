"use client";

import { IconArrowRight, IconPointerFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

export function HiringPointerBandFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface relative grid gap-10 overflow-hidden rounded-2xl border p-8 lg:grid-cols-2 lg:p-14">
          <div className="relative flex flex-col gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature292Heading}{" "}
              <span className="relative inline-block">
                {f.feature292HighlightWord}
                <IconPointerFilled
                  aria-hidden="true"
                  size={22}
                  className="text-brand absolute -right-6 -bottom-4 rotate-[-8deg]"
                />
              </span>
            </h2>
            <p className="text-muted max-w-md leading-relaxed">
              {f.feature292Body}
            </p>
          </div>
          <form className="flex flex-col justify-center gap-3">
            <label htmlFor="hiring-band-email" className="text-fg text-sm font-medium">
              {f.feature292FormLabel}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="hiring-band-email"
                type="email"
                placeholder={f.feature292FormPlaceholder}
                className="sm:flex-1"
              />
              <Button type="submit" variant="primary" className="shrink-0">
                {f.feature292FormButton}
                <IconArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
