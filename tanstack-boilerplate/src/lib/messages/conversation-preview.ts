export interface ConversationPreviewLabels {
  deletedMessage: string;
  attachmentPreview: string;
  decryptionFailed: string;
}

/**
 * Human preview line for a conversation's last message. The backend sends
 * sentinel strings for content the server can't render ("[Deleted]",
 * "[Encrypted]" or empty when only the client can decrypt) — map them to
 * localized text instead of leaking them raw.
 *
 * Shared by the messages sidebar and the shell's MessageDropdown, which had
 * diverging inline copies (the dropdown showed a raw "[Deleted]").
 */
export function conversationPreviewText(
  lastMessage: unknown,
  hasAttachments: boolean | undefined,
  t: ConversationPreviewLabels,
): string {
  if (typeof lastMessage !== "string") return "\u{1F512} " + t.decryptionFailed;
  if (lastMessage === "[Deleted]") return t.deletedMessage;
  if (lastMessage !== "" && lastMessage !== "[Encrypted]") return lastMessage;
  return hasAttachments
    ? "\u{1F4CE} " + t.attachmentPreview
    : "\u{1F512} " + t.decryptionFailed;
}
