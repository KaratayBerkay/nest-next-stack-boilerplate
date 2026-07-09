"use client";

import { useState } from "react";
import type { FindFriendsContentProps } from "@/types/find-friends/FindFriendsContent-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { apiFetch } from "@/lib/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  GQL_URL,
  MESSAGES_FRIENDS_URL,
  MESSAGES_FRIENDS_REQUESTS_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { User, FriendRequest } from "./search-utils";
import { goToPage } from "./search-utils";
import { PaginationBar } from "./PaginationBar";
import { useToast } from "@/components/ui/Toast";
import { useFriendSearch } from "./useFriendSearch";
import { useFriendActions } from "./useFriendActions";
import type { Dispatch, SetStateAction, ReactNode } from "react";

async function loadSuggested(
  setLoading: Dispatch<SetStateAction<boolean>>,
  setSuggested: Dispatch<SetStateAction<Array<{ id: string; name?: string; email: string; mutualFriends: number }>>>,
  toast: (opts: { description?: ReactNode; variant?: "default" | "destructive" | "success" }) => string,
  t: Record<string, string>,
) {
  setLoading(true);
  try {
    const res = await apiFetch(GQL_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        query: `query { suggestedFriends { id name email mutualFriends } }`,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSuggested(data.data?.suggestedFriends ?? []);
    } else {
      const data = await res.json();
      toast({
        description: data.error ?? t.failedToLoadSuggestions,
        variant: "destructive",
      });
    }
  } catch {
    toast({ description: "Network error", variant: "destructive" });
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
    <div className="rounded-xl border border-border p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {t.suggestedFriends}
      </h3>
      {!suggested.length && (
        <button
          onClick={() => loadSuggested(setLoading, setSuggested, toast, t)}
          disabled={loading}
          className="w-full rounded-lg bg-brand/10 px-3 py-2 text-xs font-medium text-brand transition-colors hover:bg-brand/20 disabled:opacity-50"
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
                className="h-8 w-8 shrink-0 bg-brand text-[10px] text-white"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.name ?? s.email}</p>
                <p className="text-[10px] text-muted">{t.mutualFriends.replace("{count}", String(s.mutualFriends))}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MediumFindFriendsContent({ user: _user }: FindFriendsContentProps) {
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
    <div className="flex min-h-0 flex-1 gap-6">
      <div className="flex min-h-0 flex-1 flex-col gap-6">
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
            <input value={query} onChange={onQueryChange} placeholder={t.searchHint} className="w-full rounded border px-3 py-2 text-sm" />
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
      <div className="hidden w-56 shrink-0 md:block">
        <SuggestedFriendsPanel />
      </div>
    </div>
  );
}
