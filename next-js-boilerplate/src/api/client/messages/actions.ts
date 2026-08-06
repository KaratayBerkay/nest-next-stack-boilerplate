import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { trackTempId } from "@/lib/realtime/event-dispatch";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";
import type { UploadScope } from "@/types/messages/UploadScope-types";

export function useMessageActions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const realtime = useRealtime();

  const sendMessage = async (
    recipientId: string,
    text: string,
    attachments?: MessageAttachment[],
  ) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (user?.id) {
      trackTempId(tempId);
      queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
        const data = old as
          { pages: { messages: Record<string, unknown>[] }[] } | undefined;
        if (!data?.pages?.length) return old;
        const pages = [...data.pages];
        const first = { ...pages[0] };
        const entry: Record<string, unknown> = {
          _tempId: tempId,
          id: tempId,
          senderId: user.id,
          recipientId,
          body: text,
          attachments,
          createdAt: new Date().toISOString(),
          pending: true,
        };
        first.messages = [...first.messages, entry];
        pages[0] = first;
        return { ...data, pages };
      });
    }

    // Preferred path: send over the wire like chat-room. The gateway echoes
    // the message back (plaintext body, _tempId) which event-dispatch uses
    // to replace the optimistic entry — no REST response round-trip, so the
    // stored encrypted row (body: null) never lands in the query cache.
    if (realtime && realtime.status === "open") {
      realtime.send({
        type: "direct-message",
        recipientId,
        text,
        tempId,
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      });
      return;
    }

    let message: Record<string, unknown> | undefined;
    try {
      const { sendMessageServer } =
        await import("@/api/server/messages/send-message");
      message = await sendMessageServer(recipientId, text, tempId, attachments);
    } catch {
      if (user?.id) {
        queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
          const data = old as
            { pages: { messages: Record<string, unknown>[] }[] } | undefined;
          if (!data?.pages?.length) return old;
          const pages = data.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              m._tempId === tempId
                ? {
                    ...(m as Record<string, unknown>),
                    failed: true,
                    pending: false,
                  }
                : m,
            ),
          }));
          return { ...data, pages };
        });
      }
      throw new Error("Failed to send message");
    }

    if (user?.id && message) {
      queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
        const data = old as
          { pages: { messages: Record<string, unknown>[] }[] } | undefined;
        if (!data?.pages?.length) return old;
        const pages = data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((m) =>
            m._tempId === tempId
              ? {
                  ...message,
                  body: message.body ?? text,
                  pending: false,
                }
              : m,
          ),
        }));
        return { ...data, pages };
      });
    }

    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const markRead = async (userId: string) => {
    try {
      const { markMessagesReadServer } =
        await import("@/api/server/messages/mark-read");
      await markMessagesReadServer(userId);
    } catch {
      // Server error — still invalidate so optimistic UI can refetch
    }
    await queryClient.invalidateQueries({
      queryKey: ["notifications", "dm-count"],
    });
    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return { sendMessage, markRead };
}

export interface UploadAttachmentOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export function useMessageUpload() {
  const uploadAttachment = async (
    file: File,
    scope: UploadScope | undefined,
    options?: UploadAttachmentOptions,
  ): Promise<MessageAttachment> => {
    const { uploadAttachmentStreamServer, toMessageAttachment } =
      await import("@/api/server/messages/upload-attachment");
    return toMessageAttachment(
      await uploadAttachmentStreamServer(
        file,
        scope,
        options?.onProgress,
        options?.signal,
      ),
    );
  };
  return { uploadAttachment };
}
