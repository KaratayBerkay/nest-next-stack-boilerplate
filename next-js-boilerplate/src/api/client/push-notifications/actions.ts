export function usePushNotificationActions() {
  const subscribe = async (subscription: Record<string, unknown>) => {
    const { subscribePushServer } = await import(
      "@/api/server/push-notifications/subscribe"
    );
    await subscribePushServer(subscription);
  };

  const unsubscribe = async (endpoint: string) => {
    const { unsubscribePushServer } = await import(
      "@/api/server/push-notifications/unsubscribe"
    );
    await unsubscribePushServer(endpoint);
  };

  return { subscribe, unsubscribe };
}
