"use client";

import Link from "next/link";
import {
  IconBrandApple,
  IconBrandGooglePlay,
  IconBrandX,
  IconBrandGithub,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer1ColProductTitle", linkKeys: ["footer1ColProductLink1", "footer1ColProductLink2", "footer1ColProductLink3"] },
  { id: "company", titleKey: "footer1ColCompanyTitle", linkKeys: ["footer1ColCompanyLink1", "footer1ColCompanyLink2", "footer1ColCompanyLink3"] },
  { id: "resources", titleKey: "footer1ColResourcesTitle", linkKeys: ["footer1ColResourcesLink1", "footer1ColResourcesLink2", "footer1ColResourcesLink3"] },
] as const;

const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer1Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer1Social2Aria" },
  { icon: IconBrandLinkedin, ariaKey: "footer1Social3Aria" },
] as const;

export function AppDownloadFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-4">
            <span className="text-fg text-lg font-semibold tracking-tight">{f.footer1Logo}</span>
            <p className="text-muted max-w-xs text-sm leading-relaxed">{f.footer1Tagline}</p>
            <div className="flex gap-2">
              <Link
                href="#"
                className="border-border bg-bg inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
              >
                <IconBrandApple size={16} aria-hidden="true" />
                {f.footer1AppStore}
              </Link>
              <Link
                href="#"
                className="border-border bg-bg inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
              >
                <IconBrandGooglePlay size={16} aria-hidden="true" />
                {f.footer1GooglePlay}
              </Link>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              <span className="text-fg text-sm font-semibold">{f[col.titleKey]}</span>
              <ul className="flex flex-col gap-2.5">
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
        <div className="border-border mt-12 flex flex-col items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between">
          <span className="text-muted text-xs">{f.footer1Copyright}</span>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <Link
                key={social.ariaKey}
                href="#"
                className="text-muted hover:text-fg"
                aria-label={f[social.ariaKey]}
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
