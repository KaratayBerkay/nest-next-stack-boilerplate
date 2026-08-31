import type { Dispatch, SetStateAction } from "react";
import { sendMessageSchema } from "@/validators/messages/schema";
import { formatDateByPreference } from "@/lib/date-time";
import type { DateDisplayFormat } from "@/constants/date-display";
import type { Message, ReplyPreview } from "@/types/messages/ChatView-types";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export function toReplyPreview(msg: Message): ReplyPreview {
  return {
    id: msg.id,
    senderId: msg.senderId,
    body: msg.body,
    deletedAt: msg.deletedAt,
    hasAttachments: !!msg.attachments?.length,
  };
}

export async function chatViewHandleSend(
  selectedUser: { id: string } | null,
  input: string,
  sendMessage: (
    recipientId: string,
    text: string,
    attachments?: MessageAttachment[],
    replyTo?: ReplyPreview | null,
  ) => Promise<void>,
  setInput: Dispatch<SetStateAction<string>>,
  setMessageError: Dispatch<SetStateAction<string | null>>,
  scrollToBottom: () => void,
  messageTooLongError: string,
  emptyMessageError: string,
  sendFailedError: string,
  attachments: MessageAttachment[] = [],
  replyTo?: ReplyPreview | null,
  clearReply?: () => void,
) {
  if (!selectedUser) return;
  const parsed = sendMessageSchema.safeParse({ text: input });
  if (!parsed.success) {
    // Ignore the schema's own built-in message — it's a raw, untranslated
    // English literal (see sendMessageSchema) and would otherwise leak
    // straight through to the UI regardless of locale.
    setMessageError(messageTooLongError);
    return;
  }
  if (!parsed.data.text && attachments.length === 0) {
    setMessageError(emptyMessageError);
    return;
  }
  setMessageError(null);
  try {
    await sendMessage(
      selectedUser.id,
      parsed.data.text,
      attachments.length > 0 ? attachments : undefined,
      replyTo,
    );
    setInput("");
    clearReply?.();
    scrollToBottom();
  } catch {
    setMessageError(sendFailedError);
  }
}

export async function chatViewHandleDelete(
  deleteMessage: (
    messageId: string,
    peerId: string,
    scope: "me" | "everyone",
  ) => Promise<void>,
  peerId: string,
  messageId: string,
  scope: "me" | "everyone",
  setMessageError: Dispatch<SetStateAction<string | null>>,
  deleteFailedMessage: string,
) {
  try {
    await deleteMessage(messageId, peerId, scope);
  } catch {
    setMessageError(deleteFailedMessage);
  }
}

export function formatMessageTime(
  dateStr: string,
  dateDisplay: DateDisplayFormat,
): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return formatDateByPreference(dateStr, dateDisplay);
}

export function groupMessagesByDate(
  messages: Message[],
): { date: string; messages: Message[] }[] {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    const date = isNaN(d.getTime()) ? "Unknown" : d.toLocaleDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
  }
  return groups;
}
