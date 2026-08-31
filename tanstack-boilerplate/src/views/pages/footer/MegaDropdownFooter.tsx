"use client";

import Link from "next/link";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/hooks/useTheme";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  { id: "product", titleKey: "footer17ColProductTitle", linkKeys: ["footer17ColProductLink1", "footer17ColProductLink2", "footer17ColProductLink3", "footer17ColProductLink4"] },
  { id: "developers", titleKey: "footer17ColDevelopersTitle", linkKeys: ["footer17ColDevelopersLink1", "footer17ColDevelopersLink2", "footer17ColDevelopersLink3", "footer17ColDevelopersLink4"] },
  { id: "company", titleKey: "footer17ColCompanyTitle", linkKeys: ["footer17ColCompanyLink1", "footer17ColCompanyLink2", "footer17ColCompanyLink3", "footer17ColCompanyLink4"] },
  { id: "legal", titleKey: "footer17ColLegalTitle", linkKeys: ["footer17ColLegalLink1", "footer17ColLegalLink2", "footer17ColLegalLink3", "footer17ColLegalLink4"] },
] as const;

export function MegaDropdownFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
          <span className="text-muted text-xs">{f.footer17Copyright}</span>
          <div className="flex items-center gap-3">
            <span className="border-success/30 bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
              <span className="bg-success size-1.5 rounded-full" aria-hidden="true" />
              {f.footer17StatusLabel}
            </span>
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={f.footer17ThemeToggleAria}
              className="border-border bg-bg text-muted hover:text-fg flex size-8 items-center justify-center rounded-full border"
            >
              {isDark ? <IconSun size={15} aria-hidden="true" /> : <IconMoon size={15} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
