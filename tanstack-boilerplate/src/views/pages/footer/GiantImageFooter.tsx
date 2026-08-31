"use client";

import Image from "next/image";
import Link from "next/link";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer11ColProductTitle", linkKeys: ["footer11ColProductLink1", "footer11ColProductLink2"] },
  { id: "company", titleKey: "footer11ColCompanyTitle", linkKeys: ["footer11ColCompanyLink1", "footer11ColCompanyLink2"] },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer11Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer11Social2Aria" },
] as const;

export function GiantImageFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full overflow-hidden border-t pt-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <span className="text-fg text-lg font-semibold tracking-tight">{f.footer11Logo}</span>
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
        <div className="border-border mt-10 flex items-center justify-between border-t py-4">
          <span className="text-muted text-xs">{f.footer11Copyright}</span>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <Link key={social.ariaKey} href="#" aria-label={f[social.ariaKey]} className="text-muted hover:text-fg">
                <social.icon size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Image
        src="/img/placeholders/ph-2x1-7.webp"
        alt={f.footer11ImageAlt}
        width={1600}
        height={800}
        className="mt-4 aspect-[2/1] w-full object-cover opacity-80"
      />
    </footer>
  );
}
