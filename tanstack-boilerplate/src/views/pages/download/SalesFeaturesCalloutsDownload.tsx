"use client";

import Image from "next/image";
import {
  IconBrandApple,
  IconBrandGooglePlay,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

const FEATURES = [
  {
    id: "alerts",
    titleKey: "download21Feature1Title",
    descKey: "download21Feature1Description",
  },
  {
    id: "team",
    titleKey: "download21Feature2Title",
    descKey: "download21Feature2Description",
  },
  {
    id: "offline",
    titleKey: "download21Feature3Title",
    descKey: "download21Feature3Description",
  },
  {
    id: "payments",
    titleKey: "download21Feature4Title",
    descKey: "download21Feature4Description",
  },
];

export function SalesFeaturesCalloutsDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <span className="text-muted text-xs font-semibold tracking-widest uppercase">
              {d.download21Badge}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
              {d.download21Title}
            </h2>
            <p className="text-muted max-w-xl lg:text-lg">
              {d.download21Description}
            </p>
            <ul className="flex flex-col gap-5">
              {FEATURES.map((feature) => (
                <li key={feature.id} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="border-border bg-surface-hover/50 text-brand flex size-9 shrink-0 items-center justify-center rounded-xl border"
                  >
                    <IconCheck size={18} />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-fg text-sm font-semibold">
                      {d[feature.titleKey]}
                    </span>
                    <span className="text-muted text-sm">
                      {d[feature.descKey]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button
                asChild
                variant="primary"
                className="!rounded-full"
                leftIcon={<IconBrandApple size={18} />}
              >
                <a href={LINK_URL}>{d.download21AppleLabel}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="!rounded-full"
                leftIcon={<IconBrandGooglePlay size={18} />}
              >
                <a href={LINK_URL}>{d.download21GoogleLabel}</a>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="border-border bg-fg relative h-[480px] w-[240px] overflow-hidden rounded-[2.5rem] border-8 shadow-xs">
              <Image
                src="/img/placeholders/ph-1x2-6.webp"
                alt={d.download21PhoneAlt}
                fill
                sizes="240px"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="bg-fg absolute top-2.5 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full"
              />
              <span className="border-border bg-surface text-fg absolute top-16 left-4 z-10 rounded-2xl border px-3.5 py-2 text-xs font-medium shadow-xs">
                {d.download21Callout1}
              </span>
              <span className="border-border bg-surface text-fg absolute right-4 bottom-24 z-10 rounded-2xl border px-3.5 py-2 text-xs font-medium shadow-xs">
                {d.download21Callout2}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
