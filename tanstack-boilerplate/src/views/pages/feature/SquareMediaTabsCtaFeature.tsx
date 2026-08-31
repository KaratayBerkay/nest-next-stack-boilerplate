"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const TABS = [
  { id: "web", labelKey: "feature164Tab1Label", src: "/img/placeholders/ph-1x1-0.webp", altKey: "feature164Tab1ImageAlt" },
  { id: "mobile", labelKey: "feature164Tab2Label", src: "/img/placeholders/ph-1x1-2.webp", altKey: "feature164Tab2ImageAlt" },
  { id: "desktop", labelKey: "feature164Tab3Label", src: "/img/placeholders/ph-1x1-6.webp", altKey: "feature164Tab3ImageAlt" },
] as const;

export function SquareMediaTabsCtaFeature() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature164Heading}
            </h2>
            <p className="text-muted leading-relaxed">{f.feature164Body}</p>
            <div className="mt-2 flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  data-state={tab.id === activeId ? "active" : "inactive"}
                  className="data-[state=active]:bg-brand data-[state=active]:text-brand-fg data-[state=inactive]:bg-surface data-[state=inactive]:text-muted data-[state=inactive]:hover:bg-surface-hover rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  {f[tab.labelKey]}
                </button>
              ))}
            </div>
            <Button asChild variant="primary" className="mt-2">
              <Link href="#">
                {f.feature164Button}
                <IconArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="border-border bg-surface overflow-hidden rounded-2xl border">
            <Image
              src={active.src}
              alt={f[active.altKey]}
              width={560}
              height={560}
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
