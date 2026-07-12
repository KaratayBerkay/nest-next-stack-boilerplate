import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import {
  MESSAGES_FRIENDS_REQUEST_PREFIX,
  MESSAGES_FRIENDS_ACCEPT_PREFIX,
  MESSAGES_FRIENDS_DECLINE_PREFIX,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export function useFriendActions() {
  const queryClient = useQueryClient();

  const sendFriendRequest = useCallback(async (userId: string) => {
    try {
      const res = await apiFetch(MESSAGES_FRIENDS_REQUEST_PREFIX + userId, {
        method: POST,
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const acceptFriendRequest = useCallback(
    async (userId: string) => {
      try {
        const res = await apiFetch(MESSAGES_FRIENDS_ACCEPT_PREFIX + userId, {
          method: POST,
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["friends", "requests"] });
          queryClient.invalidateQueries({ queryKey: ["friends", "list"] });
        }
      } catch {}
    },
    [queryClient],
  );

  const declineFriendRequest = useCallback(
    async (userId: string) => {
      try {
        const res = await apiFetch(MESSAGES_FRIENDS_DECLINE_PREFIX + userId, {
          method: POST,
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["friends", "requests"] });
        }
      } catch {}
    },
    [queryClient],
  );

  return { sendFriendRequest, acceptFriendRequest, declineFriendRequest };
}
