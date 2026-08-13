"use client";

import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandChrome,
  IconBrandUbuntu,
  IconBrandWindows,
  IconDownload,
  IconVersions,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface PlatformTile {
  id: string;
  icon: Icon;
  nameKey: string;
  archKey: string;
}

const PLATFORM_TILES: PlatformTile[] = [
  {
    id: "windows",
    icon: IconBrandWindows,
    nameKey: "download8WindowsName",
    archKey: "download8WindowsArch",
  },
  {
    id: "macos",
    icon: IconBrandApple,
    nameKey: "download8MacName",
    archKey: "download8MacArch",
  },
  {
    id: "linux",
    icon: IconBrandUbuntu,
    nameKey: "download8LinuxName",
    archKey: "download8LinuxArch",
  },
  {
    id: "chromeos",
    icon: IconBrandChrome,
    nameKey: "download8ChromeName",
    archKey: "download8ChromeArch",
  },
  {
    id: "android",
    icon: IconBrandAndroid,
    nameKey: "download8AndroidName",
    archKey: "download8AndroidArch",
  },
  {
    id: "ios",
    icon: IconBrandApple,
    nameKey: "download8IosName",
    archKey: "download8IosArch",
  },
];

export function CenteredPlatformMatrixDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download8Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download8Description}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PLATFORM_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className="border-border bg-surface flex flex-col items-center gap-2 rounded-2xl border p-5 text-center shadow-xs"
              >
                <Icon size={28} aria-hidden="true" />
                <span className="text-fg text-sm font-semibold">
                  {d[tile.nameKey]}
                </span>
                <span className="text-muted text-xs">{d[tile.archKey]}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="primary"
            size="lg"
            className="!rounded-full"
            aria-label={d.download8DownloadAria}
            leftIcon={<IconDownload size={18} aria-hidden="true" />}
          >
            <a href={LINK_URL}>{d.download8Download}</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="!rounded-full"
            aria-label={d.download8VersionsAria}
            leftIcon={<IconVersions size={18} aria-hidden="true" />}
          >
            <a href={LINK_URL}>{d.download8VersionsLabel}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
