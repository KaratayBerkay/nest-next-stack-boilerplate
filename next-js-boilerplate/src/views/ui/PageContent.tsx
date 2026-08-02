"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UI_COMPONENTS } from "@/constants/ui-gallery";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

const CATEGORY_ORDER = [
  "Feedback",
  "Overlays",
  "Forms",
  "Data",
  "Navigation",
  "Layout",
] as const;

export default function UIPage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const t = useMessages("ui");
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return UI_COMPONENTS;
    return UI_COMPONENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((c) => c.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.pageTitle}</h2>
        <p className="text-muted text-xs">{t.pageDescription}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {THEMES.map((th) => (
          <button
            key={th.name}
            type="button"
            onClick={() => setTheme(th.name)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              theme === th.name
                ? "bg-fg text-bg"
                : "bg-surface hover:bg-surface-hover text-muted",
            )}
          >
            {th.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <IconSearch
          size={16}
          className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          type="text"
          placeholder="Search components..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-border bg-surface placeholder:text-muted focus:ring-ring w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-muted text-sm">No components match your search.</p>
      )}

      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category} className="flex flex-col gap-2">
          <h3 className="text-muted text-xs font-medium tracking-wider uppercase">
            {category}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {items.map((c) => (
              <Link
                key={c.slug}
                href={`/v1/${lang}/ui/${c.slug}`}
                className="surface hover:bg-surface-hover flex flex-col gap-1 rounded-lg p-3 transition-colors"
              >
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-muted text-xs">{c.description}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
