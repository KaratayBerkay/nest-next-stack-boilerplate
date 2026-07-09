"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PageInfoButton } from "@/components/ui/page-info";
import { feedPageInfo } from "@/constants/page-info";
import { SkeletonFeedList } from "@/components/ui/skeleton-shapes";
import { FeedList } from "@/views/feed/FreeFeedList";

export function FreePageView() {
  const t = useMessages("feed");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const [search, setSearch] = useState("");

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand">{t.feed}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/v1/${lang}/share`}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            {t.share}
          </Link>
          <PageInfoButton content={feedPageInfo} />
        </div>
      </div>

      <div className="relative">
        <IconSearch
          size={14}
          stroke={1.5}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-lg border border-border bg-surface py-1.5 pl-7 pr-3 text-xs text-fg"
        />
      </div>

      <ErrorBoundary>
        <Suspense fallback={<SkeletonFeedList />}>
          <FeedList key={search} search={search} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
