import { apiFetch } from "@/lib/api-client";
import { MESSAGES_FRIENDS_REQUEST_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function sendFriendRequestServer(
  userId: string,
): Promise<boolean> {
  const res = await apiFetch(MESSAGES_FRIENDS_REQUEST_PREFIX + userId, {
    method: POST,
  });
  return res.ok;
}
