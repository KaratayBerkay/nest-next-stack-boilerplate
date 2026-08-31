"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { PAGES_EXAMPLES } from "@/constants/pages-gallery";
import { PAGES_MANIFEST } from "@/generated/pages-manifest";

export default function PagesGalleryPage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const t = useMessages("pages");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    if (!q) return PAGES_EXAMPLES;
    return PAGES_EXAMPLES.filter((page) => {
      const description =
        (t.examples as Record<string, string>)[page.descKey] ?? "";
      return (
        page.name.toLocaleLowerCase(lang).includes(q) ||
        description.toLocaleLowerCase(lang).includes(q)
      );
    });
  }, [query, lang, t.examples]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.gallery.title}</h2>
        <p className="text-muted text-xs">{t.gallery.description}</p>
      </div>
      <div className="w-full max-w-xs">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.gallery.searchPlaceholder}
          leftIcon={<IconSearch size={16} />}
          aria-label={t.gallery.searchPlaceholder}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="border-border flex flex-col items-start gap-3 rounded-lg border border-dashed p-8">
          <p className="text-muted text-sm">{t.gallery.noResults}</p>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setQuery("")}
          >
            {t.gallery.clearSearch}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((page) => {
            const count = PAGES_MANIFEST[page.slug]?.length ?? 0;
            return (
              <Link
                key={page.slug}
                href={`/v1/${lang}/pages/${page.slug}`}
                className="surface border-border hover:bg-surface-hover flex flex-col gap-1 rounded-lg border p-4 transition-colors"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{page.name}</span>
                  <span className="text-muted shrink-0 text-xs tabular-nums">
                    {t.gallery.countLabel.replace("{count}", String(count))}
                  </span>
                </span>
                <span className="text-muted text-xs leading-relaxed">
                  {(t.examples as Record<string, string>)[page.descKey]}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
