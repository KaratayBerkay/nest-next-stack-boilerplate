"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { PAGES_EXAMPLES } from "@/constants/pages-gallery";

export default function PagesGalleryPage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const t = useMessages("pages");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.gallery.title}</h2>
        <p className="text-muted text-xs">{t.gallery.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {PAGES_EXAMPLES.map((page) => (
          <Link
            key={page.slug}
            href={`/v1/${lang}/pages/${page.slug}`}
            className="surface border-border hover:bg-surface-hover flex flex-col gap-1 rounded-lg border p-4 transition-colors"
          >
            <span className="text-sm font-medium">{page.name}</span>
            <span className="text-muted text-xs leading-relaxed">
              {(t.examples as Record<string, string>)[page.descKey]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
