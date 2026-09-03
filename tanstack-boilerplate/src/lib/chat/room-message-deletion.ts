/**
 * Patch a ["room", <slug>] infinite-query cache for a room-message deletion
 * (CROSS-024). scope "me" drops the row from this viewer's list; scope
 * "everyone" turns it into a tombstone in place (array length/order kept, so
 * the list doesn't jump). Shared by the optimistic delete in
 * ChatRoomHandlers and the `room-message-deleted` frame in event-dispatch so
 * both paths converge on the same cache shape.
 */
export function applyRoomMessageDeletion(
  old: unknown,
  messageId: string,
  scope: "me" | "everyone",
  deletedAt: string,
): unknown {
  const data = old as
    | { pages: { messages: Record<string, unknown>[] }[] }
    | undefined;
  if (!data?.pages?.length) return old;
  const pages = data.pages.map((page) => ({
    ...page,
    messages:
      scope === "me"
        ? page.messages.filter((m) => m.id !== messageId)
        : page.messages.map((m) =>
            m.id === messageId
              ? { ...m, body: null, attachments: [], deletedAt }
              : m,
          ),
  }));
  return { ...data, pages };
}
