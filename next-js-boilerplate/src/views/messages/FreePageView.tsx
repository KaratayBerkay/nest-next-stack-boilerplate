"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  startTransition,
  Suspense,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { apiFetch } from "@/lib/api-client";
import { USERS_SEARCH_PREFIX } from "@/constants/api/urls";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useConversations } from "@/lib/realtime/useConversations";
import { useMessageActions } from "@/api/client/messages/actions";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useConnectionState } from "@/hooks/useConnectionState";
import { usePresence } from "@/hooks/usePresence";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PageInfoButton } from "@/components/ui/page-info";
import { messagesPageInfo } from "@/constants/page-info";
import { initials } from "@/lib/initials";
import { MessagesViewFallback } from "@/fallbacks";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { IconMenu2 } from "@tabler/icons-react";
import type { MessagesViewProps } from "@/types/messages/MessagesView-types";
import { MessagesSidebar } from "./MessagesSidebar";
import { ChatView } from "./ChatView";
import { friendsQueryOptions } from "@/api/client/friends/query";

type UserInfo = { id: string; name: string; email: string; avatarUrl: string | null };

function debouncedUserSearch(
  val: string,
  searchTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  searchAbortRef: MutableRefObject<AbortController | null>,
  setFindResults: Dispatch<SetStateAction<UserInfo[]>>,
) {
  if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  searchTimerRef.current = setTimeout(async () => {
    if (searchAbortRef.current) searchAbortRef.current.abort();
    if (val.length < 1) {
      setFindResults([]);
      return;
    }
    const ac = new AbortController();
    searchAbortRef.current = ac;
    try {
      const res = await apiFetch(
        `${USERS_SEARCH_PREFIX}?q=${encodeURIComponent(val)}`,
        { signal: ac.signal },
      );
      if (res.ok) {
        const data = await res.json();
        if (!ac.signal.aborted) setFindResults(data.items ?? []);
      } else setFindResults([]);
    } catch {
      if (!ac.signal.aborted) setFindResults([]);
    }
  }, 300);
}

function openConversationAction(
  u: UserInfo,
  markMessagesRead: (userId: string) => void,
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>,
  setTab: Dispatch<SetStateAction<"conversations" | "friends">>,
  setSidebarOpen: Dispatch<SetStateAction<boolean>>,
) {
  setSelectedUser(u);
  setTab("conversations");
  setSidebarOpen(false);
  markMessagesRead(u.id);
}

export function FreePageView({
  initialUser,
  initialFriends,
}: MessagesViewProps) {
  return (
    <Suspense fallback={<MessagesViewFallback />}>
      <ErrorBoundary>
        <MessagesPageContent
          initialUser={initialUser}
          initialFriends={initialFriends}
        />
      </ErrorBoundary>
    </Suspense>
  );
}

function MessagesPageContent({
  initialUser,
  initialFriends,
}: MessagesViewProps) {
  const t = useMessages("messages");
  const { user, loading } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const { data: friendsData } = useQuery({
    ...friendsQueryOptions(),
    initialData: initialFriends as UserInfo[],
    enabled: !!user,
  });
  const friends: UserInfo[] = useMemo(
    () =>
      (friendsData ?? []).map((f) => ({
        ...f,
        avatarUrl: (f as UserInfo).avatarUrl ?? null,
      })),
    [friendsData],
  );

  const [search, setSearch] = useState("");
  const [findInput, setFindInput] = useState("");
  const [findResults, setFindResults] = useState<UserInfo[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (val: string) => debouncedUserSearch(val, searchTimerRef, searchAbortRef, setFindResults),
    [],
  );

  const {
    data: conversationsData,
    refetch: _refetchConversations,
    isError: convsError,
  } = useConversations();
  const conversations = useMemo(
    () => conversationsData ?? [],
    [conversationsData],
  );

  const [tab, setTab] = useState<"conversations" | "friends">(
    () =>
      (typeof window !== "undefined"
        ? (sessionStorage.getItem("msg_tab") as "conversations" | "friends")
        : null) || "conversations",
  );
  useEffect(() => {
    sessionStorage.setItem("msg_tab", tab);
  }, [tab]);

  const { markRead: markMessagesRead } = useMessageActions();

  const lastParamRef = useRef<string | null>(null);
  useEffect(() => {
    const userId = initialUser;
    if (!userId || conversations.length === 0) return;
    if (lastParamRef.current === userId) return;
    lastParamRef.current = userId;
    const match = conversations.find((c) => c.user.id === userId);
    if (match) {
      startTransition(() => {
        setSelectedUser(match.user);
      });
      markMessagesRead(match.user.id);
    }
  }, [initialUser, conversations, markMessagesRead]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selectedUser) setSidebarOpen(true);
  }, [selectedUser]);

  const openConversation = useCallback(
    (u: UserInfo) => openConversationAction(u, markMessagesRead, setSelectedUser, setTab, setSidebarOpen),
    [markMessagesRead],
  );

  const { progress, direction, isSwiping } = useSwipeGesture({
    threshold: 60,
    onSwipeLeft: useCallback(() => setTab("friends"), []),
    onSwipeRight: useCallback(() => setTab("conversations"), []),
  });

  const connectionState = useConnectionState();
  const onlineUsers = usePresence();

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInRequired} />;

  const messagesUser: UserInfo = {
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    avatarUrl: user.avatarUrl ?? "",
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-5 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar
              fallback={initials(user?.name ?? user?.email ?? "?")}
              className="h-8 w-8 text-[10px]"
              title={
                connectionState === "online"
                  ? t.connected
                  : connectionState === "connecting"
                    ? t.connecting
                    : t.disconnected
              }
            />
            {connectionState === "online" ? (
              <span className="border-bg absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-success" />
            ) : connectionState === "connecting" ? (
              <span className="border-bg absolute -right-0.5 -bottom-0.5 h-3 w-3 animate-pulse rounded-full border-2 bg-success" />
            ) : (
              <span className="border-bg absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 bg-error" />
            )}
          </div>
          <h2 className="text-brand text-lg font-bold">{t.title}</h2>
        </div>
        <PageInfoButton content={messagesPageInfo} />
      </div>

      <div className="relative flex min-h-0 flex-1 gap-4">
        {sidebarOpen && (
          // Decorative dismiss backdrop, not a control — the sidebar itself and its own
          // controls remain keyboard-reachable; this scrim only needs a click target.
          <div
            className="fixed inset-0 z-40 bg-overlay/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <MessagesSidebar
          user={messagesUser}
          conversations={conversations}
          friends={friends}
          selectedUser={selectedUser}
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
          findInput={findInput}
          setFindInput={setFindInput}
          findResults={findResults}
          sentRequestIds={sentRequestIds}
          setSentRequestIds={setSentRequestIds}
          setFindResults={setFindResults}
          openConversation={openConversation}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          debouncedSearch={debouncedSearch}
          onlineUsers={onlineUsers}
          convsError={convsError}
          progress={progress}
          direction={direction ?? "right"}
          isSwiping={isSwiping}
        />

        {selectedUser ? (
          <ChatView
            selectedUser={selectedUser}
            user={messagesUser}
            setSelectedUser={setSelectedUser}
            setSidebarOpen={setSidebarOpen}
            onlineUsers={onlineUsers}
            connectionState={connectionState}
          />
        ) : (
          <div className="border-border bg-bg flex min-h-0 flex-1 items-center justify-center rounded-xl border max-md:hidden">
            <div className="flex flex-col items-center gap-2">
              <IconMenu2 size={32} className="text-muted" />
              <p className="text-muted text-sm">{t.selectConversation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
