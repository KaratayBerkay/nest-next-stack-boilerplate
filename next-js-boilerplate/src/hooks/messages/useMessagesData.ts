"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConversations } from "@/lib/realtime/useConversations";
import { friendsQueryOptions } from "@/api/client/friends/query";
import type { UserInfo } from "@/types/messages/FreePageView-types";

export function useMessagesData(
  initialFriends: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }> | null | undefined,
  hasUser: boolean,
) {
  const { data: friendsData } = useQuery({
    ...friendsQueryOptions(),
    initialData: initialFriends as UserInfo[],
    enabled: hasUser,
  });
  const friends: UserInfo[] = useMemo(
    () =>
      (friendsData ?? []).map((f) => ({
        ...f,
        avatarUrl: (f as UserInfo).avatarUrl ?? null,
      })),
    [friendsData],
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

  return { friends, conversations, convsError };
}
