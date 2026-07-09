"use client";

import { useState } from "react";
import type { FindFriendsContentProps } from "@/types/find-friends/FindFriendsContent-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { initials } from "@/lib/initials";
import { apiFetch } from "@/lib/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  MESSAGES_FRIENDS_URL,
  MESSAGES_FRIENDS_REQUESTS_URL,
} from "@/constants/api/urls";
import type { User, FriendRequest } from "./search-utils";
import { goToPage } from "./search-utils";
import { PaginationBar } from "./PaginationBar";
import { useFriendSearch } from "./useFriendSearch";
import { useFriendActions } from "./useFriendActions";

export function FreeFindFriendsContent({ user: _user }: FindFriendsContentProps) {
  const t = useMessages("find-friends");
  const pathname = usePathname();
  const { data: friends = [] } = useSuspenseQuery<User[]>({
    queryKey: ["friends", "list"],
    queryFn: () => apiFetch(MESSAGES_FRIENDS_URL).then((r) => r.json()),
  });
  const { data: friendRequests = [] } = useSuspenseQuery<FriendRequest[]>({
    queryKey: ["friends", "requests"],
    queryFn: () => apiFetch(MESSAGES_FRIENDS_REQUESTS_URL).then((r) => r.json()),
  });

  const { search, dispatch, query, searching, filtered, totalPages, onQueryChange, doSearch } =
    useFriendSearch(_user?.id);
  const { sendFriendRequest, acceptFriendRequest, declineFriendRequest } = useFriendActions();
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const pendingIds = new Set(friendRequests.map((r) => r.user.id));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-brand">{t.title}</h2>
      <Tabs defaultValue={pathname?.endsWith('/requests') ? 'pending' : 'add'} className="flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="add" className="flex-1">{t.addFriends}</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            {t.pendingRequests}
            {friendRequests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {friendRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="mt-4 flex flex-col gap-4">
          <Input value={query} onChange={onQueryChange} placeholder={t.searchHint} />
          <div className="flex flex-col gap-2">
            {query.trim().length < 3 && <p className="py-8 text-center text-sm text-muted">{t.searchHint}</p>}
            {searching && <p className="py-8 text-center text-sm text-muted">{t.searching}</p>}
            {!searching && query.trim().length >= 3 && filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t.noUsersFound}</p>}
            {!searching && filtered.map((u) => {
              const isPending = pendingIds.has(u.id) || sentIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar fallback={initials(u.name)} className="h-10 w-10 shrink-0 bg-brand text-xs text-white" />
                  <span className="flex-1 text-sm font-medium">{u.name}</span>
                  {isPending ? (
                    <span className="rounded bg-surface px-3 py-1 text-xs text-muted">{t.pending}</span>
                  ) : (
                    <button onClick={async () => { const ok = await sendFriendRequest(u.id); if (ok) setSentIds((prev) => new Set(prev).add(u.id)); }} className="rounded-lg bg-brand px-3 py-1 text-sm text-white hover:opacity-80">{t.addFriend}</button>
                  )}
                </div>
              );
            })}
            {!searching && search.total > 0 && <PaginationBar page={search.page + 1} totalPages={totalPages} onPageChange={(p) => goToPage(p - 1, dispatch, query, doSearch)} prevLabel={t.prev} nextLabel={t.next} />}
            {!searching && search.total > 0 && <p className="text-center text-[10px] text-muted">{t.usersFound.replace("{count}", String(search.total))}</p>}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-4 flex flex-col gap-2">
          {friendRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t.noRequests}</p>
          ) : (
            friendRequests.map((r: FriendRequest) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar fallback={initials(r.user.name)} className="h-10 w-10 shrink-0 bg-brand text-xs text-white" />
                <span className="flex-1 text-sm font-medium">
                  {r.user.name}
                  {r.direction === "outgoing" && <span className="ml-2 text-xs text-muted">{t.sentByYou}</span>}
                </span>
                {r.direction === "incoming" ? (
                  <>
                    <button onClick={() => acceptFriendRequest(r.user.id)} className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600">{t.accept}</button>
                    <button onClick={() => declineFriendRequest(r.user.id)} className="rounded bg-surface px-3 py-1 text-xs hover:bg-surface-hover">{t.decline}</button>
                  </>
                ) : (
                  <span className="rounded bg-surface px-3 py-1 text-xs text-muted">{t.awaiting}</span>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
