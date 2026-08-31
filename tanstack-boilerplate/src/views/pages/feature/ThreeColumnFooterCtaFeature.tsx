"use client";

import { IconArrowRight, IconBolt, IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const LINK_URL = "#" as const;

const RESOURCE_KEYS = [
  "feature158Link1",
  "feature158Link2",
  "feature158Link3",
  "feature158Link4",
] as const;

export function ThreeColumnFooterCtaFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface rounded-xl border p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="flex flex-col items-start gap-3">
              <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
                <IconBolt size={20} aria-hidden="true" />
              </span>
              <h2 className="text-fg text-xl font-semibold">
                {f.feature158BrandName}
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                {f.feature158BrandBlurb}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-fg text-sm font-semibold tracking-widest uppercase">
                {f.feature158LinksHeading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {RESOURCE_KEYS.map((key) => (
                  <li key={key}>
                    <span className="text-muted hover:text-fg flex items-center gap-2 text-sm transition-colors">
                      <IconArrowRight
                        size={14}
                        className="text-brand"
                        aria-hidden="true"
                      />
                      {f[key]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-fg text-sm font-semibold tracking-widest uppercase">
                {f.feature158CtaHeading}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f.feature158CtaBody}
              </p>
              <span className="text-fg inline-flex items-center gap-2 text-sm font-medium">
                <IconMail size={16} className="text-brand" aria-hidden="true" />
                {f.feature158CtaMail}
              </span>
            </div>
          </div>
          <div className="border-border mt-10 flex flex-col items-start gap-6 border-t pt-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
                {f.feature158FinalTitle}
              </h3>
              <p className="text-muted text-sm">{f.feature158FinalBody}</p>
            </div>
            <Button asChild variant="primary" className="shrink-0">
              <a href={LINK_URL}>
                {f.feature158FinalButton}
                <IconArrowRight size={16} aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
