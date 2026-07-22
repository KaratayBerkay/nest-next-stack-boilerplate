import type { Dispatch, SetStateAction } from "react";
import { sendMessageSchema } from "@/validators/messages/schema";
import { formatDateByPreference } from "@/lib/date-time";
import type { DateDisplayFormat } from "@/constants/date-display";
import type { Message } from "@/types/messages/ChatView-types";

export async function chatViewHandleSend(
  selectedUser: { id: string } | null,
  input: string,
  sendMessage: (recipientId: string, text: string) => Promise<void>,
  setInput: Dispatch<SetStateAction<string>>,
  setMessageError: Dispatch<SetStateAction<string | null>>,
  scrollToBottom: () => void,
) {
  if (!selectedUser) return;
  const parsed = sendMessageSchema.safeParse({ text: input });
  if (!parsed.success) {
    setMessageError(parsed.error.issues[0]?.message ?? "Invalid message");
    return;
  }
  setMessageError(null);
  try {
    await sendMessage(selectedUser.id, parsed.data.text);
    setInput("");
    scrollToBottom();
  } catch {
    setMessageError("Failed to send message. Try again.");
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
