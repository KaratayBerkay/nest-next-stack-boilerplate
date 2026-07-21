"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UI_COMPONENTS } from "@/constants/ui-gallery";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const components = UI_COMPONENTS;

export default function UIPage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const t = useMessages("ui");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.pageTitle}</h2>
        <p className="text-muted text-xs">{t.pageDescription}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {components.map((c) => (
          <Link
            key={c.slug}
            href={`/v1/${lang}/ui/${c.slug}`}
            className="surface hover:bg-surface-hover flex items-center justify-center p-4 text-center text-sm font-medium"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
