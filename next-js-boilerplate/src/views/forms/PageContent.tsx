"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FORMS_EXAMPLES } from "@/constants/forms-gallery";
import type { GalleryMode } from "@/constants/forms-gallery";

const BADGE_COLORS: Record<GalleryMode, string> = {
  real: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  simulated:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  mixed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const examples = FORMS_EXAMPLES;

export default function FormsGalleryPage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.gallery.title}</h2>
        <p className="text-muted text-xs">{t.gallery.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {examples.map((ex) => (
          <Link
            key={ex.slug}
            href={`/v1/${lang}/forms/${ex.slug}`}
            className="surface border-border hover:bg-surface-hover flex flex-col gap-2 rounded-lg border p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium">{ex.name}</span>
              <span
                className={`text-xxs shrink-0 rounded px-1.5 py-0.5 font-medium ${BADGE_COLORS[ex.mode]}`}
              >
                {t.badge[ex.mode]}
              </span>
            </div>
            <span className="text-muted text-xs leading-relaxed">
              {(t.examples as Record<string, string>)[ex.descKey]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
