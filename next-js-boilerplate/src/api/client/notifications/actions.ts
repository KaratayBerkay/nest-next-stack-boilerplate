import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markRead = useCallback(
    async (id: string) => {
      const { markNotificationReadServer } =
        await import("@/api/server/notifications/mark-read");
      await markNotificationReadServer(id);
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    [queryClient],
  );

  const markAllRead = useCallback(async () => {
    const { markAllNotificationsReadServer } =
      await import("@/api/server/notifications/mark-read");
    await markAllNotificationsReadServer();
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  return { markRead, markAllRead };
}
