import { apiFetch } from "@/lib/api-client";
import { MESSAGES_MESSAGES_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function deleteMessageForMeServer(
  messageId: string,
): Promise<void> {
  await apiFetch(`${MESSAGES_MESSAGES_PREFIX}${messageId}/delete-for-me`, {
    method: POST,
  });
}

export async function deleteMessageForEveryoneServer(
  messageId: string,
): Promise<void> {
  await apiFetch(
    `${MESSAGES_MESSAGES_PREFIX}${messageId}/delete-for-everyone`,
    { method: POST },
  );
}
