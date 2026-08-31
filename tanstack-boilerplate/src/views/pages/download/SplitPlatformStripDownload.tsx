"use client";

import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandChrome,
  IconBrandUbuntu,
  IconBrandWindows,
  IconCheck,
  IconDownload,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface PlatformRow {
  id: string;
  icon: Icon;
  nameKey: string;
  isNew: boolean;
}

const FEATURE_KEYS = [
  "download9Feature1",
  "download9Feature2",
  "download9Feature3",
  "download9Feature4",
] as const;

const PLATFORM_ROWS: PlatformRow[] = [
  {
    id: "windows",
    icon: IconBrandWindows,
    nameKey: "download9WindowsName",
    isNew: false,
  },
  {
    id: "macos",
    icon: IconBrandApple,
    nameKey: "download9MacName",
    isNew: false,
  },
  {
    id: "linux",
    icon: IconBrandUbuntu,
    nameKey: "download9LinuxName",
    isNew: false,
  },
  {
    id: "ios",
    icon: IconBrandApple,
    nameKey: "download9IosName",
    isNew: false,
  },
  {
    id: "android",
    icon: IconBrandAndroid,
    nameKey: "download9AndroidName",
    isNew: false,
  },
  {
    id: "web",
    icon: IconBrandChrome,
    nameKey: "download9WebName",
    isNew: true,
  },
];

export function SplitPlatformStripDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {d.download9Title}
            </h2>
            <p className="text-muted lg:text-lg">{d.download9Description}</p>
            <ul className="flex flex-col gap-3">
              {FEATURE_KEYS.map((featureKey) => (
                <li key={featureKey} className="flex items-center gap-3">
                  <span className="bg-brand/10 text-brand flex size-6 shrink-0 items-center justify-center rounded-full">
                    <IconCheck size={14} aria-hidden="true" />
                  </span>
                  <span className="text-fg text-sm font-medium">
                    {d[featureKey]}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="!rounded-full"
                leftIcon={<IconDownload size={18} aria-hidden="true" />}
              >
                <a href={LINK_URL}>{d.download9PrimaryButton}</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="!rounded-full"
              >
                <a href={LINK_URL}>{d.download9SecondaryButton}</a>
              </Button>
            </div>
          </div>
          <div className="border-border bg-surface rounded-3xl border p-8 shadow-xs">
            <h3 className="text-fg text-lg font-semibold">
              {d.download9PanelTitle}
            </h3>
            <ul className="divide-border mt-2 divide-y">
              {PLATFORM_ROWS.map((platform) => {
                const Icon = platform.icon;
                return (
                  <li
                    key={platform.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="text-fg flex items-center gap-3 text-sm font-medium">
                      <Icon size={18} aria-hidden="true" />
                      {d[platform.nameKey]}
                    </span>
                    {platform.isNew ? (
                      <span className="bg-brand/10 text-brand rounded-full px-2.5 py-1 text-xs font-medium">
                        {d.download9New}
                      </span>
                    ) : (
                      <span className="text-brand flex items-center gap-1.5 text-xs font-medium">
                        <IconCheck size={14} aria-hidden="true" />
                        {d.download9Available}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
