"use client";

import { useState } from "react";
import type { FindFriendsContentProps } from "@/types/find-friends/FindFriendsContent-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { friendsQueryOptions, friendRequestsQueryOptions } from "@/api/client/friends/query";
import type { User, FriendRequest } from "./search-utils";
import { PaginationBar } from "./PaginationBar";
import { useToast } from "@/components/ui/Toast";
import { useFriendSearch } from "./useFriendSearch";
import { useFriendActions } from "./useFriendActions";
import { fetchSuggestedFriendsServer } from "@/api/server/friends/suggested";

export function MediumFindFriendsContent({
  user: _user,
}: FindFriendsContentProps) {
  const t = useMessages("find-friends");
  const pathname = usePathname();
  const { data: friends = [] } = useSuspenseQuery(friendsQueryOptions());
  const { data: friendRequests = [] } = useSuspenseQuery(friendRequestsQueryOptions());

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
    <div className="flex min-h-0 flex-1 gap-6">
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
                <span className="ml-1.5 rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-semibold text-white">
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
              {!searching &&
                query.trim().length >= 3 &&
                items.length === 0 && (
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
                      <span className="flex-1 text-sm font-medium">
                        {u.name}
                      </span>
                      {isPending ? (
                        <span className="bg-surface text-muted rounded px-3 py-1 text-xs">
                          {t.pending}
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            const ok = await sendRequest(u.id);
                            if (ok)
                              setSentIds((prev) => new Set(prev).add(u.id));
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
                        className="rounded bg-success px-3 py-1 text-xs text-white hover:brightness-90"
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
      <div className="hidden w-56 shrink-0 md:block">
        <SuggestedFriendsPanel />
      </div>
    </div>
  );
}

async function loadSuggested(
  setLoading: (v: boolean) => void,
  setSuggested: (v: Array<{
    id: string;
    name?: string;
    email: string;
    mutualFriends: number;
  }>) => void,
  toast: (opts: {
    description?: string;
    variant?: "default" | "destructive" | "success";
  }) => string,
  failedMessage: string,
) {
  setLoading(true);
  try {
    const data = await fetchSuggestedFriendsServer();
    setSuggested(data);
  } catch (err) {
    toast({
      description: err instanceof Error ? err.message : failedMessage,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}

function SuggestedFriendsPanel() {
  const t = useMessages("find-friends");
  const { toast } = useToast();
  const [suggested, setSuggested] = useState<
    Array<{ id: string; name?: string; email: string; mutualFriends: number }>
  >([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="border-border rounded-xl border p-4">
      <h3 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
        {t.suggestedFriends}
      </h3>
      {!suggested.length && (
        <button
          onClick={() => loadSuggested(setLoading, setSuggested, toast, t.failedToLoadSuggestions)}
          disabled={loading}
          className="bg-brand/10 text-brand hover:bg-brand/20 w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? t.loadingSuggestions : t.loadSuggestions}
        </button>
      )}
      {suggested.length > 0 && (
        <div className="flex flex-col gap-2">
          {suggested.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Avatar
                fallback={initials(s.name ?? "?")}
                className="bg-brand h-8 w-8 shrink-0 text-[10px] text-white"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {s.name ?? s.email}
                </p>
                <p className="text-muted text-[10px]">
                  {t.mutualFriends.replace("{count}", String(s.mutualFriends))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
