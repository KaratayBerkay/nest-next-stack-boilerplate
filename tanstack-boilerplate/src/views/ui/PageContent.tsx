"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UI_COMPONENTS } from "@/constants/ui-gallery";
import { THEMES } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { InputWithIcon } from "@/components/ui/Input";

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

      <ToggleGroup
        type="single"
        value={theme}
        onValueChange={(v) =>
          v && setTheme(v as (typeof THEMES)[number]["name"])
        }
        className="flex-wrap gap-1.5 divide-x-0 border-0"
      >
        {THEMES.map((th) => (
          <ToggleGroupItem key={th.name} value={th.name} size="sm">
            {th.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <InputWithIcon
        icon={<IconSearch size={16} />}
        type="text"
        placeholder="Search components..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

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
