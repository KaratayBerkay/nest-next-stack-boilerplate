import { useQueryClient } from "@tanstack/react-query";
import { sendFriendRequestServer } from "@/api/server/messages/send-friend-request";
import { acceptFriendRequestServer } from "@/api/server/messages/accept-friend-request";
import { declineFriendRequestServer } from "@/api/server/messages/decline-friend-request";

export function useFriendActions() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["friends"] });

  const sendRequest = async (userId: string): Promise<boolean> => {
    const ok = await sendFriendRequestServer(userId);
    await invalidate();
    return ok;
  };

  const acceptRequest = async (userId: string): Promise<boolean> => {
    const ok = await acceptFriendRequestServer(userId);
    await invalidate();
    return ok;
  };

  const declineRequest = async (userId: string): Promise<boolean> => {
    const ok = await declineFriendRequestServer(userId);
    await invalidate();
    return ok;
  };

  return { sendRequest, acceptRequest, declineRequest };
}
