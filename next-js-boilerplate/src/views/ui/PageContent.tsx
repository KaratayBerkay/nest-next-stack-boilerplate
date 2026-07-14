"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UI_COMPONENTS } from "@/constants/ui-gallery";

const components = UI_COMPONENTS;

export default function UIPage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold">UI Components</h2>
        <p className="text-muted text-xs">
          Browse and inspect all custom UI components.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {components.map((c) => (
          <Link
            key={c.slug}
            href={`/v1/${lang}/ui/${c.slug}`}
            className="surface flex items-center justify-center p-4 text-center text-sm font-medium hover:bg-surface-hover"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
