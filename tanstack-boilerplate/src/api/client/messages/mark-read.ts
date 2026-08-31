import { useQueryClient } from "@tanstack/react-query";

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  const markRead = async (userId: string) => {
    const { markMessagesReadServer } =
      await import("@/api/server/messages/mark-read");
    await markMessagesReadServer(userId);
    await queryClient.invalidateQueries({
      queryKey: ["notifications", "dm-count"],
    });
  };

  return { markRead };
}
