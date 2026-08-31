"use client";

import Link from "next/link";
import { IconBrandApple, IconBrandGithub, IconBrandGooglePlay, IconBrandX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer5ColProductTitle", linkKeys: ["footer5ColProductLink1", "footer5ColProductLink2", "footer5ColProductLink3"] },
  { id: "company", titleKey: "footer5ColCompanyTitle", linkKeys: ["footer5ColCompanyLink1", "footer5ColCompanyLink2", "footer5ColCompanyLink3"] },
  { id: "legal", titleKey: "footer5ColLegalTitle", linkKeys: ["footer5ColLegalLink1", "footer5ColLegalLink2", "footer5ColLegalLink3"] },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer5Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer5Social2Aria" },
] as const;

export function AppLinksFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="w-full py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">{f[col.titleKey]}</span>
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
        <div className="border-border mt-10 flex flex-col items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Link href="#" className="border-border bg-surface inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium">
              <IconBrandApple size={16} aria-hidden="true" />
              {f.footer5AppStore}
            </Link>
            <Link href="#" className="border-border bg-surface inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium">
              <IconBrandGooglePlay size={16} aria-hidden="true" />
              {f.footer5GooglePlay}
            </Link>
          </div>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
                <social.icon size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
