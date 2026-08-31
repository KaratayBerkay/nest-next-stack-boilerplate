"use client";

import Image from "next/image";
import Link from "next/link";
import { IconMail, IconMapPin } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer25ColProductTitle",
    linkKeys: ["footer25ColProductLink1", "footer25ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer25ColCompanyTitle",
    linkKeys: ["footer25ColCompanyLink1", "footer25ColCompanyLink2"],
  },
] as const;

export function ProfileCardFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="relative w-full overflow-hidden py-16">
      <Image
        src="/img/placeholders/ph-2x1-4.webp"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover opacity-15"
      />
      <div className="bg-bg/70 absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,0.8fr))]">
          <div className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <Image
                src="/img/placeholders/ph-1x1-6.webp"
                alt=""
                aria-hidden="true"
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-fg text-sm font-semibold">
                  {f.footer25ContactName}
                </span>
                <span className="text-muted text-xs">
                  {f.footer25ContactRole}
                </span>
              </div>
            </div>
            <a
              href="mailto:hello@example.com"
              className="text-muted hover:text-fg flex items-center gap-2 text-xs"
            >
              <IconMail size={14} aria-hidden="true" />
              {f.footer25ContactEmail}
            </a>
            <span className="text-muted flex items-center gap-2 text-xs">
              <IconMapPin size={14} aria-hidden="true" />
              {f.footer25ContactAddress}
            </span>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">
                {f[col.titleKey]}
              </span>
              <ul className="flex flex-col gap-2">
                {col.linkKeys.map((linkKey) => (
                  <li key={linkKey}>
                    <Link href="#" className="text-muted hover:text-fg text-sm">
                      {f[linkKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-border mt-10 border-t pt-6">
          <span className="text-muted text-xs">{f.footer25Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
