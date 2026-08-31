"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconBrandApple,
  IconBrandUbuntu,
  IconBrandWindows,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface FormatRow {
  id: string;
  fileKey: string;
  sizeKey: string;
}

interface OsTab {
  id: string;
  icon: React.ComponentType<IconProps>;
  labelKey: string;
  formats: FormatRow[];
}

const OS_TABS: OsTab[] = [
  {
    id: "windows",
    icon: IconBrandWindows,
    labelKey: "download14TabWindows",
    formats: [
      {
        id: "exe",
        fileKey: "download14WindowsExe",
        sizeKey: "download14WindowsExeSize",
      },
      {
        id: "zip",
        fileKey: "download14WindowsZip",
        sizeKey: "download14WindowsZipSize",
      },
    ],
  },
  {
    id: "macos",
    icon: IconBrandApple,
    labelKey: "download14TabMac",
    formats: [
      {
        id: "dmg",
        fileKey: "download14MacDmg",
        sizeKey: "download14MacDmgSize",
      },
      {
        id: "pkg",
        fileKey: "download14MacPkg",
        sizeKey: "download14MacPkgSize",
      },
    ],
  },
  {
    id: "linux",
    icon: IconBrandUbuntu,
    labelKey: "download14TabLinux",
    formats: [
      {
        id: "appimage",
        fileKey: "download14LinuxAppImage",
        sizeKey: "download14LinuxAppImageSize",
      },
      {
        id: "deb",
        fileKey: "download14LinuxDeb",
        sizeKey: "download14LinuxDebSize",
      },
      {
        id: "rpm",
        fileKey: "download14LinuxRpm",
        sizeKey: "download14LinuxRpmSize",
      },
    ],
  },
];

export function SplitOsTabsFormatsDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <span className="border-border bg-surface text-brand rounded-full border px-3 py-1 text-xs font-semibold tracking-widest uppercase">
              {d.download14Badge}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
              {d.download14Title}
            </h2>
            <p className="text-muted lg:text-lg">{d.download14Description}</p>
            <p className="text-muted text-sm">{d.download14Compat}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="!rounded-full"
              >
                <a href={LINK_URL}>
                  <IconDownload size={18} />
                  {d.download14Cta}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="!rounded-full"
              >
                <a href={LINK_URL}>{d.download14CtaSecondary}</a>
              </Button>
            </div>
          </div>
          <div className="border-border bg-surface rounded-2xl border p-6 shadow-xs sm:p-8">
            <Tabs defaultValue="windows" className="w-full">
              <TabsList className="flex w-full sm:w-auto">
                {OS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      variant="pills"
                      className="flex-1 gap-2 sm:flex-none"
                    >
                      <Icon size={16} />
                      {d[tab.labelKey]}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {OS_TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="pt-6">
                  <p className="text-muted pb-2 text-xs font-semibold tracking-widest uppercase">
                    {d.download14Formats}
                  </p>
                  <div className="flex flex-col">
                    {tab.formats.map((format) => (
                      <div
                        key={format.id}
                        className="border-border flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
                      >
                        <span className="flex min-w-0 flex-col items-start gap-0.5">
                          <span className="text-fg truncate font-mono text-xs">
                            {d[format.fileKey]}
                          </span>
                          <span className="text-muted text-xs">
                            {d[format.sizeKey]}
                          </span>
                        </span>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={d.download14DownloadLabel}
                        >
                          <a href={LINK_URL}>
                            <IconDownload size={16} />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
