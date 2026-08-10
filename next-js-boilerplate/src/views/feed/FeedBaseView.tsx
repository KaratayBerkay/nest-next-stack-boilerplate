"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { InputWithIcon } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageInfoButton } from "@/components/ui/page-info";
import { feedPageInfo } from "@/constants/page-info";
import { FeedLoadingFallback } from "@/fallbacks";
import { PostStatsSidebar } from "@/components/feed/PostStatsSidebar";
import { cn } from "@/lib/cn";
import type { FeedBaseViewProps } from "@/types/feed/FeedBaseView-types";

export function FeedBaseView({
  renderFeedList,
  showPageInfo = false,
  showSidebar = false,
  className,
}: FeedBaseViewProps) {
  const t = useMessages("feed");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const [search, setSearch] = useState("");

  const searchAndList = (
    <>
      <InputWithIcon
        icon={<IconSearch size={14} stroke={1.5} />}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="text-xs"
      />

      <ErrorBoundary>
        <Suspense fallback={<FeedLoadingFallback />}>
          {renderFeedList(search)}
        </Suspense>
      </ErrorBoundary>
    </>
  );

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-6 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">{t.feed}</h2>
        {showPageInfo ? (
          <div className="flex items-center gap-2">
            <Button size="xs" asChild>
              <Link href={`/v1/${lang}/share`}>{t.share}</Link>
            </Button>
            <PageInfoButton content={feedPageInfo} />
          </div>
        ) : (
          <Button size="xs" asChild>
            <Link href={`/v1/${lang}/share`}>{t.share}</Link>
          </Button>
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
