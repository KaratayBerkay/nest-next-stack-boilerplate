"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  startTransition,
} from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuth } from "@/hooks/useAuth";
import { useMessageActions } from "@/api/client/messages/actions";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useConnectionState } from "@/hooks/useConnectionState";
import { usePresence } from "@/hooks/usePresence";
import { setActivePeerId } from "@/lib/realtime/event-dispatch";
import type { UserInfo } from "@/types/messages/FreePageView-types";
import { openConversationAction } from "@/views/messages/FreePageView-utils";
import { useMessagesSearch } from "@/hooks/messages/useMessagesSearch";
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

  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  const { friends, conversations, convsError } = useMessagesData(
    initialFriends,
    !!user,
  );

  const {
    search,
    setSearch,
    findInput,
    setFindInput,
    findResults,
    sentRequestIds,
    setSentRequestIds,
    debouncedSearch,
  } = useMessagesSearch(user?.id);

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
    friends,
    conversations,
    selectedUser,
    setSelectedUser,
    tab,
    setTab,
    sidebarOpen,
    setSidebarOpen,
    search,
    setSearch,
    findInput,
    setFindInput,
    findResults,
    sentRequestIds,
    setSentRequestIds,
    openConversation,
    debouncedSearch,
    onlineUsers,
    convsError,
    progress,
    direction,
    isSwiping,
    connectionState,
    messagesUser,
  };
}
