"use client";

import { useState } from "react";
import type { FindFriendsContentProps } from "@/types/find-friends/FindFriendsContent-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { initials } from "@/lib/initials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  friendsQueryOptions,
  friendRequestsQueryOptions,
} from "@/api/client/friends/query";
import { PageInfoButton } from "@/components/ui/page-info";
import { findFriendsPageInfo } from "@/constants/page-info";
import type { FriendRequest } from "./search-utils";
import { PaginationBar } from "./PaginationBar";
import { useFriendSearch } from "./useFriendSearch";
import { useFriendActions } from "./useFriendActions";

export function FreeFindFriendsContent({
  user: _user,
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-brand text-sm font-semibold">{t.title}</h2>
        <PageInfoButton content={findFriendsPageInfo} />
      </div>
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
          <Input
            value={query}
            onChange={onQueryChange}
            placeholder={t.searchHint}
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
              items.map((u) => {
                const isPending = pendingIds.has(u.id) || sentIds.has(u.id);
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar
                      fallback={initials(u.name)}
                      className="bg-brand h-10 w-10 shrink-0 text-xs text-white"
                    />
                    <span className="flex-1 text-sm font-medium">{u.name}</span>
                    {isPending ? (
                      <span className="bg-surface text-muted rounded px-3 py-1 text-xs">
                        {t.pending}
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          const ok = await sendRequest(u.id);
                          if (ok) setSentIds((prev) => new Set(prev).add(u.id));
                        }}
                        className="bg-brand rounded-lg px-3 py-1 text-sm text-white hover:opacity-80"
                      >
                        {t.addFriend}
                      </button>
                    )}
                  </div>
                );
              })}
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
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar
                  fallback={initials(r.user.name)}
                  className="bg-brand h-10 w-10 shrink-0 text-xs text-white"
                />
                <span className="flex-1 text-sm font-medium">
                  {r.user.name}
                  {r.direction === "outgoing" && (
                    <span className="text-muted ml-2 text-xs">
                      {t.sentByYou}
                    </span>
                  )}
                </span>
                {r.direction === "incoming" ? (
                  <>
                    <button
                      onClick={() => acceptRequest(r.user.id)}
                      className="bg-success rounded px-3 py-1 text-xs text-white hover:brightness-90"
                    >
                      {t.accept}
                    </button>
                    <button
                      onClick={() => declineRequest(r.user.id)}
                      className="bg-surface hover:bg-surface-hover rounded px-3 py-1 text-xs"
                    >
                      {t.decline}
                    </button>
                  </>
                ) : (
                  <span className="bg-surface text-muted rounded px-3 py-1 text-xs">
                    {t.awaiting}
                  </span>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
