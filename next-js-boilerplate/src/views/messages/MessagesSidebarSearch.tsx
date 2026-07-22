"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useFriendActions } from "@/api/client/friends/actions";
import type { MessagesSidebarSearchProps } from "@/types/messages/MessagesSidebarSearch-types";

export function MessagesSidebarSearch({
  tab,
  search,
  setSearch,
  findInput,
  setFindInput,
  findResults,
  user,
  friends,
  sentRequestIds,
  setSentRequestIds,
  debouncedSearch,
}: MessagesSidebarSearchProps) {
  const t = useMessages("messages");
  const { sendRequest: sendFriendRequest } = useFriendActions();
  const queryClient = useQueryClient();

  return (
    <div className="px-5 py-3">
      <div className="relative">
        <IconSearch
          size={16}
          className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          value={tab === "conversations" ? findInput : search}
          onChange={(e) => {
            const val = e.target.value;
            if (tab === "conversations") {
              setFindInput(val);
              debouncedSearch(val);
            } else {
              setSearch(val);
            }
          }}
          placeholder={t.searchUsers}
          className="bg-surface text-fg placeholder:text-muted focus:ring-brand/30 w-full rounded-lg border-0 py-2.5 pr-4 pl-9 text-sm focus:ring-1 focus:outline-none"
        />
      </div>
      {tab === "conversations" && findResults.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5">
          {findResults
            .filter(
              (u) =>
                u.id !== user.id &&
                !friends.some((f) => f.id === u.id) &&
                !sentRequestIds.has(u.id),
            )
            .slice(0, 5)
            .map((u) => (
              <div
                key={u.id}
                className="hover:bg-surface-hover flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <Avatar
                  fallback={initials(u.name ?? u.email ?? "?")}
                  className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {u.name || u.email}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    setSentRequestIds((prev) => new Set(prev).add(u.id));
                    await sendFriendRequest(u.id);
                    queryClient.invalidateQueries({
                      queryKey: ["users", "search"],
                    });
                  }}
                  className="rounded-lg text-xs"
                >
                  {t.add}
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
