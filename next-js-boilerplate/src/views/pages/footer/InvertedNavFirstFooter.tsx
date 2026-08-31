"use client";

import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer57ColProductTitle",
    linkKeys: ["footer57ColProductLink1", "footer57ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer57ColCompanyTitle",
    linkKeys: ["footer57ColCompanyLink1", "footer57ColCompanyLink2"],
  },
] as const;

export function InvertedNavFirstFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="bg-fg text-bg w-full py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold">{f[col.titleKey]}</span>
              <ul className="flex flex-col gap-2">
                {col.linkKeys.map((linkKey) => (
                  <li key={linkKey}>
                    <Link href="#" className="text-bg/70 hover:text-bg text-sm">
                      {f[linkKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-bg/15 mt-10 flex items-center justify-between border-t pt-6">
          <span className="text-lg font-semibold tracking-tight">
            {f.footer57Logo}
          </span>
          <span className="text-bg/60 text-xs">{f.footer57Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
