"use client";

import type { Dispatch, SetStateAction } from "react";
import type { useRealtime } from "@/lib/realtime/RealtimeProvider";
import type { useQueryClient } from "@tanstack/react-query";
import type { useRouter } from "next/navigation";
import { nowMs } from "@/lib/date-time";
import { trackTempId } from "@/lib/realtime/event-dispatch";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";
import {
  encryptRoomMessage,
  distributeSenderKeyIfNeeded,
} from "@/lib/crypto/sender-keys";
import { getIdentity } from "@/lib/crypto/store";

export async function chatRoomHandleSend(
  input: string,
  realtime: ReturnType<typeof useRealtime> | null,
  room: string,
  queryClient: ReturnType<typeof useQueryClient>,
  user: { id: string; name?: string | null } | null,
  setInput: Dispatch<SetStateAction<string>>,
  scrollToBottom: () => void,
  attachment?: MessageAttachment,
) {
  const text = input.trim();
  if ((!text && !attachment) || !realtime) return;
  const tempId = `temp-${nowMs()}`;

  const isE2eeEnabled =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_E2EE_DM_ENABLED === "true";

  let envelope: Record<string, unknown> | undefined;
  let displayText = text;

  if (isE2eeEnabled && (text || attachment?.cryptoMetadata) && user?.id) {
    try {
      const identity = await getIdentity();
      if (identity) {
        // Rotate/redistribute our room sender-key first if membership has
        // moved on since we last did (§1.5: lazy, per-sender, before send).
        await distributeSenderKeyIfNeeded(room, user.id, identity.deviceId);

        // Build plaintext with optional attachment metadata
        const plaintext: Record<string, unknown> = { text };
        if (attachment?.cryptoMetadata) {
          plaintext.attachment = {
            key: attachment.cryptoMetadata.key,
            nonce: attachment.cryptoMetadata.nonce,
            originalName: attachment.cryptoMetadata.originalName,
            originalType: attachment.cryptoMetadata.originalType,
            originalSize: attachment.cryptoMetadata.originalSize,
          };
        }
        const result = await encryptRoomMessage(
          room,
          identity.deviceId,
          JSON.stringify(plaintext),
          user.id,
        );
        envelope = result.envelope as unknown as Record<string, unknown>;
        displayText = ""; // encrypted messages have body=null
      }
    } catch {
      // E2EE failed — block send rather than fall back to plaintext
      return;
    }
  }

  if (user?.id) {
    trackTempId(tempId);
    queryClient.setQueryData(
      ["room", room],
      (old: Record<string, unknown>[] | undefined) => {
        const msgs = old ?? [];
        if (msgs.some((m) => (m as Record<string, unknown>).id === tempId))
          return old;
        const entry: Record<string, unknown> = {
          id: tempId,
          senderId: user.id,
          senderName: user.name ?? "Unknown",
          body: envelope ? null : displayText,
          encrypted: !!envelope,
          envelope,
          attachmentUrl: attachment?.url,
          attachmentType: attachment?.type,
          attachmentName: attachment?.name,
          createdAt: new Date().toISOString(),
          pending: true,
        };
        if (attachment?.cryptoMetadata) {
          entry.decryptedAttachment = attachment.cryptoMetadata;
        }
        return [...msgs, entry];
      },
    );
  }

  realtime.send({
    type: "room-message",
    room,
    text: envelope ? "" : displayText,
    envelope,
    tempId,
    ...(attachment
      ? {
          // For encrypted attachments, only send the URL (type/name are in the envelope)
          attachmentUrl: attachment.url,
          ...(attachment.cryptoMetadata
            ? {}
            : {
                attachmentType: attachment.type,
                attachmentName: attachment.name,
              }),
        }
      : {}),
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
