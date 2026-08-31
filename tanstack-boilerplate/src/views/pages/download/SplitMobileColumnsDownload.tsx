"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandGooglePlay,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface StoreColumn {
  id: string;
  icon: React.ComponentType<IconProps>;
  buttonIcon: React.ComponentType<IconProps>;
  nameKey: string;
  metaKey: string;
  buttonKey: string;
  featureKeys: readonly string[];
}

const STORE_COLUMNS: StoreColumn[] = [
  {
    id: "ios",
    icon: IconBrandApple,
    buttonIcon: IconBrandApple,
    nameKey: "download22IosName",
    metaKey: "download22IosMeta",
    buttonKey: "download22IosButton",
    featureKeys: [
      "download22IosFeature1",
      "download22IosFeature2",
      "download22IosFeature3",
    ],
  },
  {
    id: "android",
    icon: IconBrandAndroid,
    buttonIcon: IconBrandGooglePlay,
    nameKey: "download22AndroidName",
    metaKey: "download22AndroidMeta",
    buttonKey: "download22AndroidButton",
    featureKeys: [
      "download22AndroidFeature1",
      "download22AndroidFeature2",
      "download22AndroidFeature3",
    ],
  },
];

export function SplitMobileColumnsDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-muted text-xs font-semibold tracking-widest uppercase">
            {d.download22Badge}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download22Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download22Description}
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
          {STORE_COLUMNS.map((store) => {
            const Icon = store.icon;
            const ButtonIcon = store.buttonIcon;
            return (
              <div
                key={store.id}
                className="border-border bg-surface flex flex-col items-start gap-5 rounded-2xl border p-6 shadow-xs sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="border-border bg-surface-hover/50 text-brand flex size-12 items-center justify-center rounded-xl border"
                  >
                    <Icon size={24} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-fg text-base font-semibold">
                      {d[store.nameKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {d[store.metaKey]}
                    </span>
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {store.featureKeys.map((featureKey) => (
                    <li
                      key={featureKey}
                      className="text-muted flex items-start gap-2.5 text-sm"
                    >
                      <IconCheck size={16} className="text-brand shrink-0" />
                      {d[featureKey]}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="mt-auto w-full !rounded-full"
                  leftIcon={<ButtonIcon size={18} />}
                >
                  <a href={LINK_URL}>{d[store.buttonKey]}</a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
