"use client";

import type { Dispatch, SetStateAction } from "react";
import type { useRealtime } from "@/lib/realtime/RealtimeProvider";
import type { useQueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { nowMs } from "@/lib/date-time";
import { trackTempId } from "@/lib/realtime/event-dispatch";

export function chatRoomHandleSend(
  input: string,
  realtime: ReturnType<typeof useRealtime> | null,
  room: string,
  queryClient: ReturnType<typeof useQueryClient>,
  user: { id: string; name?: string | null } | null,
  setInput: Dispatch<SetStateAction<string>>,
  scrollToBottom: () => void,
) {
  if (!input.trim() || !realtime) return;
  const tempId = `temp-${nowMs()}`;

  if (user?.id) {
    trackTempId(tempId);
    queryClient.setQueryData(
      ["room", room],
      (old: Record<string, unknown>[] | undefined) => {
        const msgs = old ?? [];
        if (msgs.some((m) => (m as Record<string, unknown>).id === tempId))
          return old;
        return [
          ...msgs,
          {
            id: tempId,
            senderId: user.id,
            senderName: user.name ?? "Unknown",
            body: input.trim(),
            createdAt: new Date().toISOString(),
            pending: true,
          },
        ];
      },
    );
  }

  realtime.send({
    type: "room-message",
    room,
    text: input.trim(),
    tempId,
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
