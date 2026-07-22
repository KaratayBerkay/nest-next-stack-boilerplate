"use client";

import { useState } from "react";
import type { FindFriendsContentProps } from "@/types/find-friends/FindFriendsContent-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  friendsQueryOptions,
  friendRequestsQueryOptions,
} from "@/api/client/friends/query";
import type { FriendRequest } from "./search-utils";
import { PaginationBar } from "./PaginationBar";
import { UserSearchCard } from "./UserSearchCard";
import { PendingRequestCard } from "./PendingRequestCard";
import { SuggestedFriendsPanel } from "./SuggestedFriendsPanel";
import { useFriendSearch } from "./useFriendSearch";
import { useFriendActions } from "./useFriendActions";
import { cn } from "@/lib/cn";

export function MediumFindFriendsContent({
  user: _user,
  className,
}: FindFriendsContentProps) {
  const t = useMessages("find-friends");
  const pathname = usePathname();
  const { data: _friends = [] } = useSuspenseQuery(friendsQueryOptions());
  const { data: friendRequests = [] } = useSuspenseQuery(
    friendRequestsQueryOptions(),
  );

  const {
    items,
    total,
    page,
    query,
    searching,
    totalPages,
    onQueryChange,
    goToPage,
  } = useFriendSearch(_user?.id);
  const { sendRequest, acceptRequest, declineRequest } = useFriendActions();
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const pendingIds = new Set(friendRequests.map((r) => r.user.id));

  return (
    <div className={cn("flex min-h-0 flex-1 gap-6", className)}>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <h2 className="text-brand text-sm font-semibold">{t.title}</h2>
        <Tabs
          defaultValue={pathname?.endsWith("/requests") ? "pending" : "add"}
          className="flex flex-col"
        >
          <TabsList className="w-full">
            <TabsTrigger value="add" className="flex-1">
              {t.addFriends}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              {t.pendingRequests}
              {friendRequests.length > 0 && (
                <span className="bg-warning ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add" className="mt-4 flex flex-col gap-4">
            <input
              value={query}
              onChange={onQueryChange}
              placeholder={t.searchHint}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <div className="flex flex-col gap-2">
              {query.trim().length < 3 && (
                <p className="text-muted py-8 text-center text-sm">
                  {t.searchHint}
                </p>
              )}
              {searching && (
                <p className="text-muted py-8 text-center text-sm">
                  {t.searching}
                </p>
              )}
              {!searching && query.trim().length >= 3 && items.length === 0 && (
                <p className="text-muted py-8 text-center text-sm">
                  {t.noUsersFound}
                </p>
              )}
              {!searching &&
                items.map((u) => (
                  <UserSearchCard
                    key={u.id}
                    userId={u.id}
                    name={u.name}
                    isPending={pendingIds.has(u.id) || sentIds.has(u.id)}
                    onSendRequest={async () => {
                      const ok = await sendRequest(u.id);
                      if (ok) setSentIds((prev) => new Set(prev).add(u.id));
                    }}
                    pendingLabel={t.pending}
                    addFriendLabel={t.addFriend}
                  />
                ))}
              {!searching && total > 0 && (
                <PaginationBar
                  page={page + 1}
                  totalPages={totalPages}
                  onPageChange={(p) => goToPage(p - 1)}
                  prevLabel={t.prev}
                  nextLabel={t.next}
                />
              )}
              {!searching && total > 0 && (
                <p className="text-muted text-center text-[10px]">
                  {t.usersFound.replace("{count}", String(total))}
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="pending" className="mt-4 flex flex-col gap-2">
            {friendRequests.length === 0 ? (
              <p className="text-muted py-8 text-center text-sm">
                {t.noRequests}
              </p>
            ) : (
              friendRequests.map((r: FriendRequest) => (
                <PendingRequestCard
                  key={r.id}
                  request={r}
                  onAccept={acceptRequest}
                  onDecline={declineRequest}
                  sentByYouLabel={t.sentByYou}
                  acceptLabel={t.accept}
                  declineLabel={t.decline}
                  awaitingLabel={t.awaiting}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden w-56 shrink-0 md:block">
        <SuggestedFriendsPanel />
      </div>
    </div>
  );
}
