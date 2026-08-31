export async function logEvents(
  events: Record<string, unknown>[],
): Promise<void> {
  const { logEventServer } = await import("@/api/server/events/log");
  await logEventServer(events);
}
