"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer52ColProductTitle", linkKeys: ["footer52ColProductLink1", "footer52ColProductLink2"] },
  { id: "company", titleKey: "footer52ColCompanyTitle", linkKeys: ["footer52ColCompanyLink1", "footer52ColCompanyLink2"] },
  { id: "resources", titleKey: "footer52ColResourcesTitle", linkKeys: ["footer52ColResourcesLink1", "footer52ColResourcesLink2"] },
] as const;

export function MutedGridContrastBarFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="bg-surface-hover w-full">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
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
      </div>
      <div className="bg-brand py-3">
        <span className="text-brand-fg mx-auto block max-w-6xl px-6 text-center text-xs lg:px-8">
          {f.footer52Copyright}
        </span>
      </div>
    </footer>
  );
}
