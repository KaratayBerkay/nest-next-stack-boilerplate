"use client";

import Image from "next/image";
import { IconBrandApple, IconBrandGooglePlay } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;
const PHONE_ONE_IMAGE = "/img/placeholders/ph-1x2-3.webp" as const;
const PHONE_TWO_IMAGE = "/img/placeholders/ph-1x2-6.webp" as const;
const STORE_CARD_CLASS =
  "border-border bg-surface flex items-center gap-4 rounded-2xl border px-6 py-4 transition-colors hover:bg-surface-hover" as const;
const PHONE_FRAME_CLASS =
  "border-fg relative h-64 w-32 overflow-hidden rounded-[2.5rem] border-8 bg-fg shadow-lg" as const;

export function PhoneMockupPromoDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download7Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download7Description}
          </p>
        </div>
        <div className="mt-12 flex items-start justify-center">
          <div className={PHONE_FRAME_CLASS}>
            <Image
              src={PHONE_ONE_IMAGE}
              alt={d.download7PhoneAlt}
              width={128}
              height={256}
              className="absolute inset-0 h-full w-full rounded-[2rem] object-cover"
            />
            <span
              aria-hidden="true"
              className="bg-bg/80 absolute top-2.5 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full"
            />
          </div>
          <div className={`${PHONE_FRAME_CLASS} mt-8 -ml-8 rotate-3`}>
            <Image
              src={PHONE_TWO_IMAGE}
              alt={d.download7PhoneSecondAlt}
              width={128}
              height={256}
              className="absolute inset-0 h-full w-full rounded-[2rem] object-cover"
            />
            <span
              aria-hidden="true"
              className="bg-bg/80 absolute top-2.5 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full"
            />
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={LINK_URL}
            aria-label={d.download7AppleAria}
            className={STORE_CARD_CLASS}
          >
            <IconBrandApple size={28} aria-hidden="true" />
            <span className="flex flex-col items-start">
              <span className="text-muted text-xs">
                {d.download7ApplePrefix}
              </span>
              <span className="text-fg text-base font-semibold">
                {d.download7AppleName}
              </span>
            </span>
          </a>
          <a
            href={LINK_URL}
            aria-label={d.download7GoogleAria}
            className={STORE_CARD_CLASS}
          >
            <IconBrandGooglePlay size={26} aria-hidden="true" />
            <span className="flex flex-col items-start">
              <span className="text-muted text-xs">
                {d.download7GooglePrefix}
              </span>
              <span className="text-fg text-base font-semibold">
                {d.download7GoogleName}
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
