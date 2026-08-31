import { apiFetch } from "@/lib/api-client";
import { MESSAGES_MESSAGES_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function deleteMessageForMeServer(
  messageId: string,
): Promise<void> {
  const res = await apiFetch(
    `${MESSAGES_MESSAGES_PREFIX}${messageId}/delete-for-me`,
    { method: POST },
  );
  // apiFetch never throws on a non-2xx response — the caller's optimistic
  // removal is wrapped in try/catch specifically to roll back on failure
  // (e.g. the delete-for-everyone window closing right as the request
  // lands), but without this throw that catch never ran.
  if (!res.ok) throw new Error("Failed to delete message");
}

export async function deleteMessageForEveryoneServer(
  messageId: string,
): Promise<void> {
  const res = await apiFetch(
    `${MESSAGES_MESSAGES_PREFIX}${messageId}/delete-for-everyone`,
    { method: POST },
  );
  if (!res.ok) throw new Error("Failed to delete message");
}
