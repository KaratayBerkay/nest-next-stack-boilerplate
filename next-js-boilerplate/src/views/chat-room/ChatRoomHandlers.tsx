"use client";

import type { Dispatch, SetStateAction } from "react";
import type { useRealtime } from "@/lib/realtime/RealtimeProvider";
import type { useQueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { nowMs } from "@/lib/date-time";
import {
  trackTempId,
  scheduleSendTimeout,
} from "@/lib/realtime/event-dispatch";
import { sendMessageSchema } from "@/validators/messages/schema";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export async function chatRoomHandleSend(
  input: string,
  realtime: ReturnType<typeof useRealtime> | null,
  room: string,
  queryClient: ReturnType<typeof useQueryClient>,
  user: { id: string; name?: string | null } | null,
  setInput: Dispatch<SetStateAction<string>>,
  scrollToBottom: () => void,
  setMessageError: Dispatch<SetStateAction<string | null>>,
  messageTooLongError: string,
  attachments?: MessageAttachment[],
) {
  // Unlike DMs (ChatView-utils.ts's sendMessageSchema check), room messages
  // had no client-side length check at all — an over-limit message just sat
  // pending forever with no feedback once the backend silently dropped it.
  if (!sendMessageSchema.safeParse({ text: input }).success) {
    setMessageError(messageTooLongError);
    return;
  }
  setMessageError(null);
  const text = input.trim();
  if ((!text && (!attachments || attachments.length === 0)) || !realtime)
    return;
  const tempId = `temp-${nowMs()}`;

  if (user?.id) {
    trackTempId(tempId);
    // Cache is an infinite-query page list (see roomMessagesQueryOptions) —
    // mirrors useMessageActions.sendMessage's optimistic insert for DMs.
    queryClient.setQueryData(["room", room], (old: unknown) => {
      const data = old as
        { pages: { messages: Record<string, unknown>[] }[] } | undefined;
      if (!data?.pages?.length) return old;
      const pages = [...data.pages];
      const first = { ...pages[0] };
      if (first.messages.some((m) => m.id === tempId)) return old;
      first.messages = [
        ...first.messages,
        {
          id: tempId,
          senderId: user.id,
          senderName: user.name ?? "Unknown",
          body: text,
          attachments,
          createdAt: new Date().toISOString(),
          pending: true,
        },
      ];
      pages[0] = first;
      return { ...data, pages };
    });
    // Room sends have no REST fallback and no other failure signal — if the
    // server never echoes this frame back (see dispatchEvent's room-message
    // handling), the message would otherwise stay "pending" forever.
    scheduleSendTimeout(tempId, () => {
      queryClient.setQueryData(["room", room], (old: unknown) => {
        const data = old as
          { pages: { messages: Record<string, unknown>[] }[] } | undefined;
        if (!data?.pages?.length) return old;
        const pages = data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((m) =>
            m.id === tempId ? { ...m, failed: true, pending: false } : m,
          ),
        }));
        return { ...data, pages };
      });
    });
  }

  realtime.send({
    type: "room-message",
    room,
    text,
    tempId,
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  });
  setInput("");
  scrollToBottom();
}

export function selectChatRoom(
  r: string,
  setRoom: Dispatch<SetStateAction<string>>,
  setRoomMembers: Dispatch<
    SetStateAction<{ id: string; name: string; avatar?: string }[]>
  >,
  setSidebarOpen: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
) {
  setRoom(r);
  setRoomMembers([]);
  setSidebarOpen(false);
  router.replace(`?room=${r}`, { scroll: false });
}
