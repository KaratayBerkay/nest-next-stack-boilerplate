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
  type SetStateAction,
} from "react";
import { searchUsersQueryOptions } from "@/api/client/users/search";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useConversations } from "@/lib/realtime/useConversations";
import { useMessageActions } from "@/api/client/messages/actions";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useConnectionState } from "@/hooks/useConnectionState";
import { usePresence } from "@/hooks/usePresence";
import { setActivePeerId } from "@/lib/realtime/event-dispatch";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { MessagesViewFallback } from "@/fallbacks";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { IconMenu2 } from "@tabler/icons-react";
import type { MessagesViewProps } from "@/types/messages/MessagesView-types";
import { MessagesSidebar } from "./MessagesSidebar";
import { ChatView } from "./ChatView";
import { friendsQueryOptions } from "@/api/client/friends/query";

type UserInfo = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearch = useCallback((val: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  }, []);

  const { data: searchData } = useQuery({
    ...searchUsersQueryOptions(debouncedQuery, 20, 0),
    enabled: debouncedQuery.trim().length >= 1 && !!user,
  });
  const findResults = useMemo(
    () => (searchData?.items ?? []) as UserInfo[],
    [searchData],
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

  useEffect(() => {
    setActivePeerId(selectedUser?.id ?? null);
  }, [selectedUser]);

  const openConversation = useCallback(
    (u: UserInfo) =>
      openConversationAction(
        u,
        markMessagesRead,
        setSelectedUser,
        setTab,
        setSidebarOpen,
      ),
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
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      {sidebarOpen && (
        <div
          className="bg-overlay/30 fixed inset-0 z-40 md:hidden"
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

      <div className="hidden min-h-0 flex-1 md:flex">
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
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <IconMenu2 size={32} className="text-muted" />
              <p className="text-muted text-sm">{t.selectConversation}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 md:hidden">
        {selectedUser ? (
          <ChatView
            selectedUser={selectedUser}
            user={messagesUser}
            setSelectedUser={setSelectedUser}
            setSidebarOpen={setSidebarOpen}
            onlineUsers={onlineUsers}
            connectionState={connectionState}
          />
        ) : null}
      </div>
    </div>
  );
}
