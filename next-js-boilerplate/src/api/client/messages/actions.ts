import { useQueryClient } from "@tanstack/react-query";

export function useMessageActions() {
  const queryClient = useQueryClient();

  const sendMessage = async (recipientId: string, text: string) => {
    const { sendMessageServer } = await import(
      "@/api/server/messages/send-message"
    );
    await sendMessageServer(recipientId, text);
    await queryClient.invalidateQueries({ queryKey: ["messages"] });
    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const markRead = async (userId: string) => {
    const { markMessagesReadServer } = await import(
      "@/api/server/messages/mark-read"
    );
    await markMessagesReadServer(userId);
    await queryClient.invalidateQueries({ queryKey: ["notifications", "dm-count"] });
    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return { sendMessage, markRead };
}
