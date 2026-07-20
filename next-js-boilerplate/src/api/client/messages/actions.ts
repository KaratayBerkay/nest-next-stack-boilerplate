import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function useMessageActions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const sendMessage = async (recipientId: string, text: string) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (user?.id) {
      queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
        const data = old as
          { pages: { messages: Record<string, unknown>[] }[] } | undefined;
        if (!data?.pages?.length) return old;
        const pages = [...data.pages];
        const first = { ...pages[0] };
        first.messages = [
          ...first.messages,
          {
            _tempId: tempId,
            id: tempId,
            senderId: user.id,
            recipientId,
            body: text,
            createdAt: new Date().toISOString(),
            pending: true,
          },
        ];
        pages[0] = first;
        return { ...data, pages };
      });
    }

    let message: Record<string, unknown> | undefined;
    try {
      const { sendMessageServer } =
        await import("@/api/server/messages/send-message");
      message = await sendMessageServer(recipientId, text);
    } catch {
      if (user?.id) {
        queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
          const data = old as
            { pages: { messages: Record<string, unknown>[] }[] } | undefined;
          if (!data?.pages?.length) return old;
          const pages = data.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              m._tempId === tempId
                ? {
                    ...(m as Record<string, unknown>),
                    failed: true,
                    pending: false,
                  }
                : m,
            ),
          }));
          return { ...data, pages };
        });
      }
      throw new Error("Failed to send message");
    }

    if (user?.id && message) {
      queryClient.setQueryData(["messages", recipientId], (old: unknown) => {
        const data = old as
          { pages: { messages: Record<string, unknown>[] }[] } | undefined;
        if (!data?.pages?.length) return old;
        const pages = data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((m) =>
            m._tempId === tempId ? { ...message, pending: false } : m,
          ),
        }));
        return { ...data, pages };
      });
    }

    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const markRead = async (userId: string) => {
    const { markMessagesReadServer } =
      await import("@/api/server/messages/mark-read");
    await markMessagesReadServer(userId);
    await queryClient.invalidateQueries({
      queryKey: ["notifications", "dm-count"],
    });
    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return { sendMessage, markRead };
}
