"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PageInfoButton } from "@/components/ui/page-info";
import { feedPageInfo } from "@/constants/page-info";
import { FeedLoadingFallback } from "@/fallbacks";
import { PostStatsSidebar } from "@/components/feed/PostStatsSidebar";
import type { FeedBaseViewProps } from "@/types/feed/FeedBaseView-types";

export function FeedBaseView({
  renderFeedList,
  showPageInfo = false,
  showSidebar = false,
}: FeedBaseViewProps) {
  const t = useMessages("feed");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const [search, setSearch] = useState("");

  const searchAndList = (
    <>
      <div className="relative">
        <IconSearch
          size={14}
          stroke={1.5}
          className="text-muted pointer-events-none absolute top-1/2 left-2 -translate-y-1/2"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="border-border bg-surface text-fg w-full rounded-lg border py-1.5 pr-3 pl-7 text-xs"
        />
      </div>

      <ErrorBoundary>
        <Suspense fallback={<FeedLoadingFallback />}>
          {renderFeedList(search)}
        </Suspense>
      </ErrorBoundary>
    </>
  );

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">{t.feed}</h2>
        {showPageInfo ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/v1/${lang}/share`}
              className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-brand-fg hover:opacity-90"
            >
              {t.share}
            </Link>
            <PageInfoButton content={feedPageInfo} />
          </div>
        ) : (
          <Link
            href={`/v1/${lang}/share`}
            className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-brand-fg hover:opacity-90"
          >
            {t.share}
          </Link>
        )}
      </div>

      {showSidebar ? (
        <div className="flex min-h-0 flex-1 gap-4">
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {searchAndList}
          </div>

          <div className="hidden w-56 shrink-0 md:block">
            <PostStatsSidebar />
          </div>
        </div>
      ) : (
        searchAndList
      )}
    </div>
  );
}
