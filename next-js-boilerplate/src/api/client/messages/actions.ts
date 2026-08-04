import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { trackTempId } from "@/lib/realtime/event-dispatch";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export function useMessageActions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const sendMessage = async (
    recipientId: string,
    text: string,
    attachment?: MessageAttachment,
  ) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Check if E2EE is enabled and encrypt
    let envelope: Record<string, unknown> | undefined;
    let plaintext: string | undefined;
    const { isE2eeDmEnabled, encryptForSend } =
      await import("@/lib/crypto/chat").catch(() => ({
        isE2eeDmEnabled: () => false,
        encryptForSend: async () => {
          throw new Error("E2EE module not available");
        },
      }));

    if (isE2eeDmEnabled() && user?.id) {
      const ownUserId = user.id;
      try {
        const result = await encryptForSend(
          ownUserId,
          text,
          recipientId,
          attachment?.cryptoMetadata,
        );
        envelope = result.envelope as unknown as Record<string, unknown>;
        plaintext = result.plaintext.text;
      } catch (err) {
        // First attempt failed — try re-registering keys and retrying
        // once before giving up. This handles stale bundles, depleted
        // OTPK pools, and server-side key expiry.
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("no registered E2EE keys")) {
          throw new Error(
            "This user hasn't set up encrypted messaging yet. Ask them to open Messages to enable it.",
          );
        }
        console.warn("[E2EE] Encryption failed, retrying after re-sync:", err);
        try {
          const { ensureIdentity } = await import("@/lib/crypto/identity");
          const { getDeviceId } = await import("@/lib/crypto/chat");
          const { registerBundleServer } =
            await import("@/api/server/e2ee/register-bundle");
          const deviceId = getDeviceId(ownUserId);
          const { bundle, serverPrekeys } = await ensureIdentity(
            ownUserId,
            deviceId,
          );
          await registerBundleServer({ bundle, oneTimePrekeys: serverPrekeys });

          // Retry encryption with refreshed keys
          const retryResult = await encryptForSend(
            ownUserId,
            text,
            recipientId,
            attachment?.cryptoMetadata,
          );
          envelope = retryResult.envelope as unknown as Record<string, unknown>;
          plaintext = retryResult.plaintext.text;
        } catch (retryErr) {
          console.warn("[E2EE] Retry after re-sync also failed:", retryErr);
          throw new Error("Encryption failed after key resync. Try again.");
        }
      }
    }

    if (user?.id) {
      trackTempId(tempId);
      queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
        const data = old as
          | { pages: { messages: Record<string, unknown>[] }[] }
          | undefined;
        if (!data?.pages?.length) return old;
        const pages = [...data.pages];
        const first = { ...pages[0] };
        const entry: Record<string, unknown> = {
          _tempId: tempId,
          id: tempId,
          senderId: user.id,
          recipientId,
          body: plaintext ?? text,
          encrypted: !!envelope,
          envelope: envelope ?? null,
          attachmentUrl: attachment?.url,
          attachmentType: attachment?.type,
          attachmentName: attachment?.name,
          createdAt: new Date().toISOString(),
          pending: true,
        };
        if (attachment?.cryptoMetadata) {
          entry.decryptedAttachment = attachment.cryptoMetadata;
        }
        first.messages = [...first.messages, entry];
        pages[0] = first;
        return { ...data, pages };
      });
    }

    let message: Record<string, unknown> | undefined;
    try {
      const { sendMessageServer } =
        await import("@/api/server/messages/send-message");
      message = await sendMessageServer(
        recipientId,
        text,
        tempId,
        attachment,
        envelope,
      );
    } catch {
      if (user?.id) {
        queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
          const data = old as
            | { pages: { messages: Record<string, unknown>[] }[] }
            | undefined;
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
          | { pages: { messages: Record<string, unknown>[] }[] }
          | undefined;
        if (!data?.pages?.length) return old;
        const pages = data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((m) =>
            m._tempId === tempId ? { ...message, pending: false } : m,
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

export function useMessageUpload() {
  const uploadAttachment = async (file: File): Promise<MessageAttachment> => {
    const { uploadAttachmentServer, toMessageAttachment } =
      await import("@/api/server/messages/upload-attachment");

    // Treating a module-load failure as "E2EE unavailable" (not an
    // encryption failure) mirrors useMessageActions.sendMessage above.
    const { isE2eeDmEnabled } = await import("@/lib/crypto/chat").catch(() => ({
      isE2eeDmEnabled: () => false,
    }));

    if (isE2eeDmEnabled()) {
      // No catch-and-fall-back-to-plaintext here: an attachment that fails
      // to encrypt should block the upload, not silently leave a plaintext
      // file behind an encrypted-looking message bubble.
      const { encryptAttachmentForUpload } =
        await import("@/lib/crypto/attachments");
      const { encryptedBlob, metadata } =
        await encryptAttachmentForUpload(file);
      const result = await uploadAttachmentServer(encryptedBlob);
      const attachment = toMessageAttachment(result);
      // Override name/type with originals (server sees opaque blob)
      return {
        ...attachment,
        name: metadata.originalName,
        type: metadata.originalType,
        cryptoMetadata: metadata,
      };
    }

    return toMessageAttachment(await uploadAttachmentServer(file));
  };
  return { uploadAttachment };
}
