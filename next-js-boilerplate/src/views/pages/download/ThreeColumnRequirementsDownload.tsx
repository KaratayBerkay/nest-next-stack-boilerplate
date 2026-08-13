"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconBrandApple,
  IconBrandUbuntu,
  IconBrandWindows,
  IconCheck,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface OsDownload {
  id: string;
  icon: React.ComponentType<IconProps>;
  nameKey: string;
  versionKey: string;
  reqKeys: readonly string[];
}

const OS_DOWNLOADS: OsDownload[] = [
  {
    id: "windows",
    icon: IconBrandWindows,
    nameKey: "download19WindowsName",
    versionKey: "download19WindowsVersion",
    reqKeys: [
      "download19WindowsReq1",
      "download19WindowsReq2",
      "download19WindowsReq3",
      "download19WindowsReq4",
    ],
  },
  {
    id: "macos",
    icon: IconBrandApple,
    nameKey: "download19MacName",
    versionKey: "download19MacVersion",
    reqKeys: [
      "download19MacReq1",
      "download19MacReq2",
      "download19MacReq3",
      "download19MacReq4",
    ],
  },
  {
    id: "linux",
    icon: IconBrandUbuntu,
    nameKey: "download19LinuxName",
    versionKey: "download19LinuxVersion",
    reqKeys: [
      "download19LinuxReq1",
      "download19LinuxReq2",
      "download19LinuxReq3",
      "download19LinuxReq4",
    ],
  },
];

export function ThreeColumnRequirementsDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-muted text-xs font-semibold tracking-widest uppercase">
            {d.download19Badge}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download19Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download19Description}
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {OS_DOWNLOADS.map((os) => {
            const Icon = os.icon;
            return (
              <div
                key={os.id}
                className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-6 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Icon size={32} />
                  <span className="text-fg text-base font-semibold">
                    {d[os.nameKey]}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-muted text-xs font-semibold tracking-widest uppercase">
                    {d.download19RequirementsLabel}
                  </span>
                  <ul className="flex flex-col gap-2.5">
                    {os.reqKeys.map((reqKey) => (
                      <li
                        key={reqKey}
                        className="text-muted flex items-start gap-2.5 text-sm"
                      >
                        <IconCheck size={16} className="text-brand shrink-0" />
                        {d[reqKey]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-border mt-auto flex items-center justify-between gap-3 border-t pt-5">
                  <span className="text-muted font-mono text-xs">
                    {d[os.versionKey]}
                  </span>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="!rounded-full"
                    leftIcon={<IconDownload size={15} />}
                  >
                    <a href={LINK_URL}>{d.download19Download}</a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
