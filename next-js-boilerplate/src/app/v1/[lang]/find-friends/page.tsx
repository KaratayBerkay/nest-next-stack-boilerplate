"use client";

import { useState, useEffect, useReducer, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { apiFetch } from "@/lib/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

type User = { id: string; name: string };

type FriendRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  user: User;
};

const PAGE_SIZE = 10;

interface SearchState {
  items: User[];
  total: number;
  page: number;
}

type SearchAction =
  | { type: "results"; items: User[]; total: number }
  | { type: "page"; page: number }
  | { type: "clear" };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "results":
      return { ...state, items: action.items, total: action.total };
    case "page":
      return { ...state, page: action.page };
    case "clear":
      return { items: [], total: 0, page: 0 };
  }
}

function PaginationBar({
  page,
  totalPages,
  onPageChange,
  prevLabel,
  nextLabel,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  prevLabel: string;
  nextLabel: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="text-muted hover:bg-surface-hover rounded px-2 py-1 text-xs disabled:opacity-30"
      >
        {prevLabel}
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-muted px-1 text-xs">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
              p === page
                ? "bg-brand text-white"
                : "text-muted hover:bg-surface-hover"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="text-muted hover:bg-surface-hover rounded px-2 py-1 text-xs disabled:opacity-30"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default function FindFriendsPage() {
  const t = useMessages("find-friends");
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const { data: friends = [] } = useQuery<User[]>({
    queryKey: ["friends", "list"],
    queryFn: () => apiFetch("/api/messages/friends").then((r) => r.json()),
    enabled: !!user,
  });
  const { data: friendRequests = [] } = useQuery<FriendRequest[]>({
    queryKey: ["friends", "requests"],
    queryFn: () =>
      apiFetch("/api/messages/friends/requests").then((r) => r.json()),
    enabled: !!user,
  });
  const [search, dispatch] = useReducer(searchReducer, {
    items: [],
    total: 0,
    page: 0,
  });
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pendingIds = new Set(friendRequests.map((r) => r.user.id));
  const friendIds = new Set(friends.map((f) => f.id));
  const totalPages = Math.ceil(search.total / PAGE_SIZE);

  const doSearch = useCallback((q: string, p: number) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      dispatch({ type: "clear" });
      return;
    }
    const skip = p * PAGE_SIZE;
    setSearching(true);
    fetch(
      `/api/users/search?q=${encodeURIComponent(trimmed)}&take=${PAGE_SIZE}&skip=${skip}`,
    )
      .then((res) => (res.ok ? res.json() : { items: [], total: 0 }))
      .then((data) =>
        dispatch({ type: "results", items: data.items, total: data.total }),
      )
      .catch(() => dispatch({ type: "results", items: [], total: 0 }))
      .finally(() => setSearching(false));
  }, []);

  const onQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);

      if (q.trim().length < 3) {
        dispatch({ type: "clear" });
        return;
      }

      dispatch({ type: "page", page: 0 });

      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => doSearch(q, 0), 300);
    },
    [doSearch],
  );

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const goToPage = (p: number) => {
    dispatch({ type: "page", page: p });
    doSearch(query.trim(), p);
  };

  const filtered = search.items.filter((u) => {
    if (u.id === user?.id) return false;
    if (friendIds.has(u.id)) return false;
    return true;
  });

  const sendFriendRequest = useCallback(async (userId: string) => {
    try {
      const res = await apiFetch(`/api/messages/friends/request/${userId}`, {
        method: "POST",
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const acceptFriendRequest = useCallback(async (userId: string) => {
    try {
      const res = await apiFetch(`/api/messages/friends/accept/${userId}`, {
        method: "POST",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["friends", "requests"] });
        queryClient.invalidateQueries({ queryKey: ["friends", "list"] });
      }
    } catch {}
  }, [queryClient]);

  const declineFriendRequest = useCallback(async (userId: string) => {
    try {
      const res = await apiFetch(`/api/messages/friends/decline/${userId}`, {
        method: "POST",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["friends", "requests"] });
      }
    } catch {}
  }, [queryClient]);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message="Sign in to find friends" />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">{t.title}</h2>

      <Tabs defaultValue="add" className="flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="add" className="flex-1">
            {t.addFriends}
          </TabsTrigger>
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
              filtered.length === 0 && (
                <p className="text-muted py-8 text-center text-sm">
                  {t.noUsersFound}
                </p>
              )}

            {!searching &&
              filtered.map((u) => {
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
                          const ok = await sendFriendRequest(u.id);
                          if (ok) {
                            setSentIds((prev) => new Set(prev).add(u.id));
                          }
                        }}
                        className="bg-brand rounded-lg px-3 py-1 text-sm text-white hover:opacity-80"
                      >
                        {t.addFriend}
                      </button>
                    )}
                  </div>
                );
              })}

            {!searching && search.total > 0 && (
              <PaginationBar
                page={search.page + 1}
                totalPages={totalPages}
                onPageChange={(p) => goToPage(p - 1)}
                prevLabel={t.prev}
                nextLabel={t.next}
              />
            )}

            {!searching && search.total > 0 && (
              <p className="text-muted text-center text-[10px]">
                {t.usersFound.replace("{count}", String(search.total))}
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
                      onClick={() => acceptFriendRequest(r.user.id)}
                      className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
                    >
                      {t.accept}
                    </button>
                    <button
                      onClick={() => declineFriendRequest(r.user.id)}
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
