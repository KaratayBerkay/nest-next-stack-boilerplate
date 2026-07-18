import { useQueryClient } from "@tanstack/react-query";

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markRead = async (id: string) => {
    const { markNotificationReadServer } = await import(
      "@/api/server/notifications/mark-read"
    );
    await markNotificationReadServer(id);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllRead = async () => {
    const { markAllNotificationsReadServer } = await import(
      "@/api/server/notifications/mark-read"
    );
    await markAllNotificationsReadServer();
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return { markRead, markAllRead };
}
