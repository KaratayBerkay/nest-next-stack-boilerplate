import { useQueryClient } from "@tanstack/react-query";
import { markNotificationReadServer, markAllNotificationsReadServer } from "@/api/server/notifications/mark-read";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  const markRead = async (id: string) => {
    await markNotificationReadServer(id);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllRead = async () => {
    await markAllNotificationsReadServer();
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return { markRead, markAllRead };
}
