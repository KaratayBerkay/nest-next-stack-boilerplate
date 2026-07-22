"use client";

import { useRef, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { FRIEND_GROUPS } from "./pagination-data";

function scrollToPageModuleLevel(
  pageIndex: number,
  sentinelRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
) {
  const sentinel = sentinelRefs.current[pageIndex - 1];
  if (sentinel) {
    sentinel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function OnlineFriendsTab({
  page,
  setPage,
}: {
  page: number;
  setPage: (page: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-page-index"));
            if (!isNaN(index)) {
              setPage(index);
            }
          }
        }
      },
      { root: container, threshold: 0.3 },
    );

    const sentinels = sentinelRefs.current.filter(Boolean) as HTMLDivElement[];
    for (const el of sentinels) observer.observe(el);

    return () => observer.disconnect();
  }, [setPage]);

  const scrollToPage = useCallback(
    (pageIndex: number) => scrollToPageModuleLevel(pageIndex, sentinelRefs),
    [sentinelRefs],
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="scroll-fade-y relative max-h-80 overflow-y-auto"
      >
        <div className="flex flex-col">
          {FRIEND_GROUPS.map((group, groupIndex) => {
            const pageNum = groupIndex + 1;
            return (
              <div key={pageNum}>
                <div
                  ref={(el) => {
                    sentinelRefs.current[groupIndex] = el;
                  }}
                  data-page-index={pageNum}
                />
                {group.map((friend) => (
                  <div
                    key={friend.name}
                    className="hover:bg-surface-hover border-border flex items-center gap-3 border-b px-4 py-3"
                  >
                    <Avatar
                      fallback={friend.initials}
                      size="sm"
                      status={friend.online ? "online" : undefined}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {friend.name}
                      </p>
                      <p className="text-muted flex items-center gap-1 text-xs">
                        <span
                          className={`inline-block size-1.5 rounded-full ${
                            friend.online ? "bg-success" : "bg-border"
                          }`}
                        />
                        {friend.online ? "Online" : "Offline"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-brand text-brand-fg shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: FRIEND_GROUPS.length }, (_, i) => {
          const dotPage = i + 1;
          return (
            <button
              key={dotPage}
              type="button"
              onClick={() => scrollToPage(dotPage)}
              className={`size-2 rounded-full transition-colors ${
                page === dotPage ? "bg-brand" : "bg-border"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
