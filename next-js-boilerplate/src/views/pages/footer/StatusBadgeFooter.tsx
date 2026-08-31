"use client";

import Image from "next/image";
import Link from "next/link";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer15ColProductTitle",
    linkKeys: ["footer15ColProductLink1", "footer15ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer15ColCompanyTitle",
    linkKeys: ["footer15ColCompanyLink1", "footer15ColCompanyLink2"],
  },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer15Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer15Social2Aria" },
] as const;

export function StatusBadgeFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.footer15Logo}
            </span>
            <Link
              href="#"
              className="border-success/30 bg-success/10 text-success inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            >
              <span
                className="bg-success size-1.5 rounded-full"
                aria-hidden="true"
              />
              {f.footer15StatusLabel}
            </Link>
            <div className="flex items-center gap-2">
              <Image
                src="/img/placeholders/ph-1x1-3.webp"
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="size-4 rounded-sm object-cover"
              />
              <span className="text-muted text-xs">{f.footer15Country}</span>
            </div>
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
          <div className="flex gap-3 sm:justify-end">
            {SOCIALS.map((social) => (
              <Link
                key={social.ariaKey}
                href="#"
                aria-label={f[social.ariaKey]}
                className="text-muted hover:text-fg"
              >
                <social.icon size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
