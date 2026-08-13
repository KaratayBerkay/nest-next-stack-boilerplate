"use client";

import Image from "next/image";
import { IconQrcode } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const QR_SIZE = 21;
const FINDER = 7;
const QR_SEED = 20260813;

const FINDER_ORIGINS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, QR_SIZE - FINDER],
  [QR_SIZE - FINDER, 0],
];

function inFinder(row: number, col: number): boolean {
  return FINDER_ORIGINS.some(([originRow, originCol]) => {
    const dr = row - originRow;
    const dc = col - originCol;
    if (dr < 0 || dr >= FINDER || dc < 0 || dc >= FINDER) {
      return false;
    }
    const onRing =
      dr === 0 || dr === FINDER - 1 || dc === 0 || dc === FINDER - 1;
    const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
    return onRing || inCore;
  });
}

function isQrCellOn(row: number, col: number): boolean {
  if (inFinder(row, col)) {
    return true;
  }
  const value = Math.sin(row * 12.9898 + col * 78.233 + QR_SEED) * 43758.5453;
  return value - Math.floor(value) > 0.5;
}

export function MobileQrPromoDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-muted text-xs font-semibold tracking-widest uppercase">
            {d.download20Badge}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download20Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download20Description}
          </p>
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-16">
          <div className="border-border bg-fg relative h-[480px] w-[240px] shrink-0 overflow-hidden rounded-[2.5rem] border-8 shadow-xs">
            <Image
              src="https://picsum.photos/seed/download-20-phone/240/480"
              alt={d.download20PhoneAlt}
              fill
              sizes="240px"
              className="object-cover"
            />
            <span
              aria-hidden="true"
              className="bg-fg absolute top-2.5 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full"
            />
          </div>
          <div className="border-border bg-surface flex flex-col items-center gap-4 rounded-2xl border p-6 shadow-xs">
            <div className="border-border bg-surface rounded-xl border p-3">
              <div aria-label={d.download20QrAria} className="flex flex-col">
                {Array.from({ length: QR_SIZE }, (_, row) => (
                  <div key={row} className="flex">
                    {Array.from({ length: QR_SIZE }, (_, col) => (
                      <span
                        key={col}
                        className={cn(
                          "size-[6px]",
                          isQrCellOn(row, col) && "bg-fg",
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconQrcode size={16} className="text-brand" />
              <span className="text-fg text-sm font-semibold">
                {d.download20ScanLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
