import { apiFetch } from "@/lib/api-client";
import { MESSAGES_FRIENDS_DECLINE_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function declineFriendRequestServer(
  userId: string,
): Promise<boolean> {
  const res = await apiFetch(MESSAGES_FRIENDS_DECLINE_PREFIX + userId, {
    method: POST,
  });
  return res.ok;
}
