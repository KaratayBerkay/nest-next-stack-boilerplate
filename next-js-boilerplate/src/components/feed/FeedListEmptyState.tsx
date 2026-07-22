"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function FeedListEmptyState() {
  const t = useMessages("feed");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <p className="text-muted text-sm">{t.noPostsYet}</p>
      <Link
        href={`/v1/${lang}/share`}
        className="bg-brand rounded-lg px-4 py-2 text-sm font-medium text-brand-fg"
      >
        {t.beFirstToShare}
      </Link>
    </div>
  );
}
