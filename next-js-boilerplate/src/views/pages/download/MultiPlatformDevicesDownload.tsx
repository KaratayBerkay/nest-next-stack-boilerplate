"use client";

import {
  IconArrowRight,
  IconBrandAndroid,
  IconBrandApple,
  IconBrandChrome,
  IconBrandEdge,
  IconBrandFirefox,
  IconBrandGooglePlay,
  IconBrandSafari,
  IconBrandUbuntu,
  IconBrandWindows,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;
const STORE_BADGE_CLASS =
  "border-border bg-surface-hover/50 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-surface-hover" as const;

interface DesktopRow {
  id: string;
  icon: Icon;
  nameKey: string;
  metaKey: string;
}

interface BrowserRow {
  id: string;
  icon: Icon;
  nameKey: string;
}

const DESKTOP_ROWS: DesktopRow[] = [
  {
    id: "windows",
    icon: IconBrandWindows,
    nameKey: "download10WindowsName",
    metaKey: "download10WindowsMeta",
  },
  {
    id: "macos",
    icon: IconBrandApple,
    nameKey: "download10MacName",
    metaKey: "download10MacMeta",
  },
  {
    id: "linux",
    icon: IconBrandUbuntu,
    nameKey: "download10LinuxName",
    metaKey: "download10LinuxMeta",
  },
];

const BROWSER_ROWS: BrowserRow[] = [
  { id: "chrome", icon: IconBrandChrome, nameKey: "download10ChromeName" },
  { id: "firefox", icon: IconBrandFirefox, nameKey: "download10FirefoxName" },
  { id: "edge", icon: IconBrandEdge, nameKey: "download10EdgeName" },
  { id: "safari", icon: IconBrandSafari, nameKey: "download10SafariName" },
];

export function MultiPlatformDevicesDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download10Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download10Description}
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="border-border bg-surface-hover/50 text-brand flex size-10 items-center justify-center rounded-xl border">
                <IconDeviceDesktop size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-fg text-base font-semibold">
                  {d.download10DesktopLabel}
                </h3>
                <p className="text-muted text-xs">
                  {d.download10DesktopDescription}
                </p>
              </div>
            </div>
            <ul className="border-border divide-border flex flex-col divide-y rounded-2xl border">
              {DESKTOP_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={20} aria-hidden="true" />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-fg text-sm font-medium">
                          {d[row.nameKey]}
                        </span>
                        <span className="text-muted text-xs">
                          {d[row.metaKey]}
                        </span>
                      </span>
                    </span>
                    <a
                      href={LINK_URL}
                      aria-label={d.download10DownloadAria}
                      className="text-brand flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      {d.download10DesktopDownload}
                      <IconArrowRight size={16} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="border-border bg-surface-hover/50 text-brand flex size-10 items-center justify-center rounded-xl border">
                <IconDeviceMobile size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-fg text-base font-semibold">
                  {d.download10MobileLabel}
                </h3>
                <p className="text-muted text-xs">
                  {d.download10MobileDescription}
                </p>
              </div>
            </div>
            <div className="text-muted flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <IconBrandApple size={14} aria-hidden="true" />
                {d.download10IosName}
              </span>
              <span className="flex items-center gap-1.5">
                <IconBrandAndroid size={14} aria-hidden="true" />
                {d.download10AndroidName}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={LINK_URL}
                aria-label={d.download10StoreAria}
                className={STORE_BADGE_CLASS}
              >
                <IconBrandApple size={22} aria-hidden="true" />
                <span className="flex flex-col items-start">
                  <span className="text-muted text-[11px]">
                    {d.download10AppStorePrefix}
                  </span>
                  <span className="text-fg text-sm font-semibold">
                    {d.download10AppStoreName}
                  </span>
                </span>
              </a>
              <a
                href={LINK_URL}
                aria-label={d.download10StoreAria}
                className={STORE_BADGE_CLASS}
              >
                <IconBrandGooglePlay size={20} aria-hidden="true" />
                <span className="flex flex-col items-start">
                  <span className="text-muted text-[11px]">
                    {d.download10GooglePlayPrefix}
                  </span>
                  <span className="text-fg text-sm font-semibold">
                    {d.download10GooglePlayName}
                  </span>
                </span>
              </a>
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="border-border bg-surface-hover/50 text-brand flex size-10 items-center justify-center rounded-xl border">
                <IconWorld size={20} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-fg text-base font-semibold">
                  {d.download10BrowserLabel}
                </h3>
                <p className="text-muted text-xs">
                  {d.download10BrowserDescription}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BROWSER_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <a
                    key={row.id}
                    href={LINK_URL}
                    aria-label={`${d[row.nameKey]} ${d.download10BrowserInstall}`}
                    className="border-border bg-surface-hover/50 hover:bg-surface-hover flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-colors"
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="flex flex-col items-start">
                      <span className="text-fg text-sm font-medium">
                        {d[row.nameKey]}
                      </span>
                      <span className="text-muted text-[11px]">
                        {d.download10BrowserInstall}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <p className="text-muted mt-8 text-center text-sm">
          {d.download10Note}
        </p>
      </div>
    </section>
  );
}
