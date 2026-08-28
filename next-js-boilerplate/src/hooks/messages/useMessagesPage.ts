"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuth } from "@/hooks/useAuth";
import { useMessageActions } from "@/api/client/messages/actions";
import { useConnectionState } from "@/hooks/useConnectionState";
import { usePresence } from "@/hooks/usePresence";
import { setActivePeerId } from "@/lib/realtime/active-peer";
import type { UserInfo } from "@/types/messages/FreePageView-types";
import type { SidebarFilter } from "@/types/messages/MessagesSidebarFilterBar-types";
import { openConversationAction } from "@/views/messages/FreePageView-utils";
import { useMessagesData } from "@/hooks/messages/useMessagesData";

type UseMessagesPageInput = {
  initialUser?: string | null;
  initialFriends?: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }> | null;
};

export function useMessagesPage({
  initialUser,
  initialFriends,
}: UseMessagesPageInput) {
  const t = useMessages("messages");
  const { user, loading } = useAuth();

  const [selectedUserState, setSelectedUser] = useState<UserInfo | null>(null);

  const { friends, conversations, convsError, convsLoading } = useMessagesData(
    initialFriends,
    !!user,
  );

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<SidebarFilter>(
    () =>
      (typeof window !== "undefined"
        ? (sessionStorage.getItem("msg_filter") as SidebarFilter)
        : null) || "all",
  );
  useEffect(() => {
    sessionStorage.setItem("msg_filter", filter);
  }, [filter]);

  const { markRead: markMessagesRead, toggleFavorite } = useMessageActions();

  const lastParamRef = useRef<string | null>(null);
  useEffect(() => {
    const userId = initialUser;
    if (!userId) return;
    if (lastParamRef.current === userId) return;
    // A friend with no message history yet has no entry in `conversations`
    // (that list only has threads with at least one message) — fall back to
    // `friends` so "Message" from the Friends page can open a brand-new,
    // empty conversation instead of silently landing on nothing. Don't mark
    // this userId as handled until a match is actually found: `friends` can
    // still be loading on the first render this effect sees.
    const match =
      conversations.find((c) => c.user.id === userId)?.user ??
      friends.find((f) => f.id === userId);
    if (match) {
      lastParamRef.current = userId;
      startTransition(() => {
        setSelectedUser(match);
      });
      markMessagesRead(match.id);
    }
  }, [initialUser, conversations, friends, markMessagesRead]);

  // selectedUserState is a point-in-time snapshot taken on click/URL-match,
  // not a live view — it never updates on its own when the underlying user's
  // profile changes (e.g. a peer toggling hideAvatar mid-conversation while
  // the WS "renew" refetch keeps `conversations`/`friends` fresh). Overlay
  // the live record on every render instead of syncing via effect: without
  // this, the sidebar (rendered straight from those live lists) updates
  // immediately while the open chat's header and message-bubble avatars keep
  // showing the stale, pre-toggle avatarUrl until the conversation is
  // reselected or the page reloads.
  const selectedUser = useMemo(() => {
    if (!selectedUserState) return null;
    return (
      conversations.find((c) => c.user.id === selectedUserState.id)?.user ??
      friends.find((f) => f.id === selectedUserState.id) ??
      selectedUserState
    );
  }, [selectedUserState, conversations, friends]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!selectedUser) startTransition(() => setSidebarOpen(true));
  }, [selectedUser]);

  useEffect(() => {
    setActivePeerId(selectedUser?.id ?? null);
    // Leaving the messages page must clear the peer so realtime frames
    // received elsewhere (e.g. the feed page) are not auto-marked read.
    return () => setActivePeerId(null);
  }, [selectedUser]);

  const openConversation = useCallback(
    (u: UserInfo) =>
      openConversationAction(
        u,
        markMessagesRead,
        setSelectedUser,
        setSidebarOpen,
      ),
    [markMessagesRead],
  );

  const onToggleFavorite = useCallback(
    (peerId: string, next: boolean) => {
      toggleFavorite(peerId, next).catch(() => {
        // Optimistic update already rolled back inside toggleFavorite.
      });
    },
    [toggleFavorite],
  );

  const connectionState = useConnectionState();
  const onlineUsers = usePresence();

  const messagesUser: UserInfo = user
    ? {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        avatarUrl: user.avatarUrl ?? "",
      }
    : { id: "", name: "", email: "", avatarUrl: null };

  return {
    t,
    user,
    loading,
    conversations,
    friends,
    selectedUser,
    setSelectedUser,
    filter,
    setFilter,
    sidebarOpen,
    setSidebarOpen,
    search,
    setSearch,
    openConversation,
    onToggleFavorite,
    onlineUsers,
    convsError,
    convsLoading,
    connectionState,
    messagesUser,
  };
}
