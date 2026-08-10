"use client";

import type { Dispatch, SetStateAction } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { InputWithIcon } from "@/components/ui/Input";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useFriendActions } from "@/api/client/friends/actions";
import type { MessagesSidebarSearchProps } from "@/types/messages/MessagesSidebarSearch-types";

async function handleSendFriendRequest(
  friendId: string,
  setSentRequestIds: Dispatch<SetStateAction<Set<string>>>,
  sendRequest: (userId: string) => Promise<boolean>,
  queryClient: QueryClient,
) {
  setSentRequestIds((prev) => new Set(prev).add(friendId));
  await sendRequest(friendId);
  queryClient.invalidateQueries({ queryKey: ["users", "search"] });
}

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
      <InputWithIcon
        icon={<IconSearch size={16} />}
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
        className="border-0"
      />
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
                  src={u.avatarUrl ?? undefined}
                  fallback={initials(u.name ?? u.email ?? "?")}
                  className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {u.name || u.email}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    handleSendFriendRequest(
                      u.id,
                      setSentRequestIds,
                      sendFriendRequest,
                      queryClient,
                    )
                  }
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
