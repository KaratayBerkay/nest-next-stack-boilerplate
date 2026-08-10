"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import { FORMS_EXAMPLES } from "@/constants/forms-gallery";
import type { GalleryMode } from "@/constants/forms-gallery";

const BADGE_VARIANTS: Record<GalleryMode, BadgeVariant> = {
  real: "success",
  simulated: "warning",
  mixed: "info",
  none: "secondary",
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
              <Badge variant={BADGE_VARIANTS[ex.mode]} className="shrink-0">
                {t.badge[ex.mode]}
              </Badge>
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
